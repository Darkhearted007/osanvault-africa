#!/bin/bash
set -e

echo "🚀 Starting Full ÒsánVault Africa Deployment..."

# ==============================
# 1. Fix apt & update system
# ==============================
echo "🔧 Updating system packages..."
sed -i 's|http://.*archive.ubuntu.com|http://archive.ubuntu.com|g' /etc/apt/sources.list
apt update -y && apt upgrade -y

# ==============================
# 2. Install dependencies
# ==============================
echo "📦 Installing dependencies..."
apt install -y curl gnupg git nginx

# ==============================
# 3. Install Node.js + Yarn
# ==============================
echo "📦 Installing Node.js 22 & Yarn..."
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
corepack enable
corepack prepare yarn@stable --activate

# ==============================
# 4. Install Blockchain SDKs
# ==============================
echo "🔗 Installing Bundlr/Irys SDK..."
npm install -g @bundlr-network/client @irys/sdk

# ==============================
# 5. Setup GitHub Auth
# ==============================
echo "🔑 Configuring Git..."
git config --global user.name "ÒsánVault Africa Bot"
git config --global user.email "info@osanvaultafrica.com"

# Replace with your PAT
GITHUB_PAT="REDACTED_TOKEN"
git remote set-url origin https://Darkhearted007:${GITHUB_PAT}@github.com/Darkhearted007/osanvault-africa.git

# ==============================
# 6. Build Project
# ==============================
echo "🌍 Building ÒsánVault Africa..."
cd ~/osanvault-africa
git pull origin main
yarn install || npm install

# Inject Google Analytics + GTM into <head> and <body>
find . -name "*.html" -type f -exec sed -i '/<head>/a \
<!-- Google Tag Manager -->\n<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({"gtm.start":new Date().getTime(),event:"gtm.js"});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!="dataLayer"?"&l="+l:"";j.async=true;j.src="https://www.googletagmanager.com/gtm.js?id=GTM-KBNFDZML"+dl;f.parentNode.insertBefore(j,f);})(window,document,"script","dataLayer","GTM-KBNFDZML");</script>\n<!-- End Google Tag Manager -->' {} +

find . -name "*.html" -type f -exec sed -i '/<body>/a \
<!-- Google Tag Manager (noscript) -->\n<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KBNFDZML" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>\n<!-- End Google Tag Manager (noscript) -->' {} +

yarn build || npm run build

# ==============================
# 7. Deploy to Nginx
# ==============================
echo "📤 Deploying to Nginx..."
rm -rf /var/www/html/*
cp -r dist/* /var/www/html/ || cp -r build/* /var/www/html/
systemctl restart nginx

# ==============================
# 8. Push to GitHub
# ==============================
echo "⬆️ Committing & pushing to GitHub..."
git add .
git commit -m "Automated deployment 🚀" || echo "ℹ️ Nothing to commit"
git push origin main

# ==============================
# 9. Setup GitHub Actions auto-deploy (future ready)
# ==============================
echo "⚡ Adding GitHub Actions workflow..."
mkdir -p .github/workflows
cat > .github/workflows/deploy.yml <<'EOF'
name: Deploy ÒsánVault Africa

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: yarn install || npm install
      - run: yarn build || npm run build
      - uses: appleboy/ssh-action@v1.0.3
        with:
          host: \${{ secrets.VPS_HOST }}
          username: \${{ secrets.VPS_USER }}
          key: \${{ secrets.VPS_SSH_KEY }}
          script: |
            cd ~/osanvault-africa
            git pull origin main
            yarn install || npm install
            yarn build || npm run build
            rm -rf /var/www/html/*
            cp -r dist/* /var/www/html/ || cp -r build/* /var/www/html/
            systemctl restart nginx
EOF

git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions auto-deploy ⚡" || echo "ℹ️ Workflow already exists"
git push origin main

echo "✅ Deployment & CI/CD setup completed successfully!"
