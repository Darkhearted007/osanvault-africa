import subprocess, time
script_path = "dashboard_public.py"
while True:
    try:
        subprocess.run(["python3", script_path])
    except Exception as e:
        print("⚠️ dashboard_public crashed, restarting...", e)
    time.sleep(5)
