from pathlib import Path
import os
import subprocess
import sys
import tempfile
import textwrap

REPOS = ('.',)


def report(child='', count=1, failures=0, errors=0, skipped=0):
    case = f'<testcase name="case">{child}</testcase>' if count else ''
    return (f'<testsuites><testsuite tests="{count}" failures="{failures}" '
            f'errors="{errors}" skipped="{skipped}">'
            f'{case}</testsuite></testsuites>')


for name in REPOS:
    workflow = (Path(__file__).parent / name / '.github/workflows/tests.yml').read_text(encoding='utf8')
    code = textwrap.dedent(workflow.split("<<'PY'\n", 1)[1].split('\n          PY', 1)[0])
    samples = [
        ('pass', report(), 'success', 0),
        ('missing', None, 'success', 1),
        ('empty', report(count=0), 'success', 1),
        ('malformed', '<testsuites>', 'success', 1),
        ('failed', report('<failure/>', failures=1), 'success', 1),
        ('error', report('<error/>', errors=1), 'success', 1),
        ('skipped', report('<skipped/>', skipped=1), 'success', 1),
        ('runner-failed', report(), 'failure', 1),
    ]
    for case, xml, outcome, expected in samples:
        with tempfile.TemporaryDirectory() as temporary:
            directory = Path(temporary)
            results = directory / 'results'
            results.mkdir()
            if xml is not None:
                (results / 'junit.xml').write_text(xml, encoding='utf8')
            env = os.environ | {
                'TEST_OUTCOME': outcome, 'REPORT_PATTERN': 'results/junit.xml',
                'SUMMARY_FILE': 'results/summary.md',
                'GITHUB_STEP_SUMMARY': str(directory / 'github-summary.md'),
                'ARTIFACT_URL': '', 'BASE_URL': 'https://example.com/',
            }
            run = subprocess.run([sys.executable, '-c', code], cwd=directory,
                                 env=env, capture_output=True, text=True)
            assert run.returncode == expected, (name, case, run.stderr)
            summary = (directory / 'github-summary.md').read_text(encoding='utf8')
            assert ('Gate: **aprovado**.' if expected == 0 else 'Gate: **reprovado**.') in summary
    print(f'{name}: {len(samples)} gate checks passed')
