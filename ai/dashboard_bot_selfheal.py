import subprocess, time
script_path = "dashboard_bot.py"
while True:
    try:
        subprocess.run(["python3", script_path])
    except Exception as e:
        print("⚠️ dashboard_bot crashed, restarting...", e)
    time.sleep(5)
