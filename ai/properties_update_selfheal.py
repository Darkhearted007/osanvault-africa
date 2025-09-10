import subprocess, time
script_path = "properties_update.py"
while True:
    try:
        subprocess.run(["python3", script_path])
    except Exception as e:
        print("⚠️ properties_update crashed, restarting...", e)
    time.sleep(5)
