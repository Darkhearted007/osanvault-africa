#!/bin/bash
# Òsánvault Africa — VPS Hardening Script
# Run as root on fresh VPS deployment
# SECURITY: Must be reviewed before execution

set -e

echo "[+] Òsánvault VPS Hardening"

# 1. System updates
apt-get update && apt-get upgrade -y

# 2. Fail2ban (brute-force protection)
apt-get install -y fail2ban ufw
systemctl enable fail2ban
systemctl enable ufw

# 3. UFW defaults
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw limit 22/tcp comment 'SSH rate limit'
ufw --force enable
ufw reload

# 4. Fail2ban jail for API
cat > /etc/fail2ban/jail.local << 'JAILEOF'
[osanvault-api]
enabled = true
port = 3001
filter = osanvault-api
logpath = /var/log/osanvault/api.log
maxretry = 20
findtime = 60
bantime = 3600
action = iptables-allports

[osanvault-auth]
enabled = true
port = 3001
filter = osanvault-auth
logpath = /var/log/osanvault/api.log
maxretry = 5
findtime = 900
bantime = 3600
action = iptables-allports
JAILEOF

# 5. SSH hardening — disable password auth, use keys only
if ! grep -q "PasswordAuthentication no" /etc/ssh/sshd_config 2>/dev/null; then
  echo "PasswordAuthentication no" >> /etc/ssh/sshd_config
fi
if ! grep -q "PermitRootLogin no" /etc/ssh/sshd_config 2>/dev/null; then
  echo "PermitRootLogin no" >> /etc/ssh/sshd_config
fi
systemctl restart sshd

# 6. Kernel hardening
cat >> /etc/sysctl.conf << 'KERNEOF'
# IP spoofing protection
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1

# Disable ICMP redirect acceptance
net.ipv4.conf.all.accept_redirects = 0
net.ipv6.conf.all.accept_redirects = 0

# Disable send redirects
net.ipv4.conf.all.send_redirects = 0

# Enable source address verification
net.ipv4.conf.all.accept_source_route = 0
net.ipv6.conf.all.accept_source_route = 0

# Log suspicious packets
net.ipv4.conf.all.log_martians = 1

# Increase network device queue
net.core.netdev_max_backlog = 5000

# Increase TCP max buffer
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216
KERNEOF

sysctl -p

# 7. Create osanvault system user (no login, for running services)
useradd -r -s /usr/sbin/nologin -d /opt/osanvault -m osanvault 2>/dev/null || true

# 8. App log directory
mkdir -p /var/log/osanvault
chown osanvault:osanvault /var/log/osanvault
chmod 750 /var/log/osanvault

echo "[+] VPS hardening complete"
echo "[!] Review /etc/fail2ban/jail.local before enabling services"