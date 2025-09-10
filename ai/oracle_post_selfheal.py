import subprocess, time
script_path = "oracle_post.py"
while True:
    try:
        subprocess.run(["python3", script_path])
    except Exception as e:
        print("⚠️ oracle_post crashed, restarting...", e)
    time.sleep(5)
