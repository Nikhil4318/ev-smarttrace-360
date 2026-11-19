import subprocess
import os

git_bin = r"C:\Users\dell\AppData\Local\GitHubDesktop\app-3.4.20\resources\app\git\cmd\git.exe"
cwd = r"c:\Users\dell\OneDrive\Desktop\Portfolio 2\ev-smart"

def run_git(args):
    res = subprocess.run([git_bin] + args, cwd=cwd, capture_output=True, text=True)
    print(">>> git", " ".join(args))
    if res.stdout.strip():
        print(res.stdout.strip())
    if res.stderr.strip():
        print(res.stderr.strip())
    return res.returncode

run_git(["init"])
run_git(["config", "user.name", "Alex Rivers"])
run_git(["config", "user.email", "demo@evsmarttrace.com"])
run_git(["add", "."])
run_git(["status", "--short"])
run_git(["commit", "-m", "Initial commit: EV SmartTrace 360 - AI-Powered EV Intelligence Platform"])
run_git(["branch", "-M", "main"])
run_git(["log", "-1", "--oneline"])
