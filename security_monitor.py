import os
import time

LOGS = "/root/osanvault-africa/logs"
while True:
    # Check for failed login attempts
    os.system("journalctl -u ssh -n 20 >> {}/ssh_security.log".format(LOGS))
    # Check for unusual bot behavior
    os.system("ps aux >> {}/process_monitor.log".format(LOGS))
    # SEO placeholder: sitemap generation
    os.system("echo 'Sitemap updated at ' + time.strftime('%Y-%m-%d %H:%M:%S') >> {}/seo.log".format(LOGS))
    time.sleep(300)  # Run every 5 minutes
