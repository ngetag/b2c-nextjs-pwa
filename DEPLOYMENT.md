# DEPLOYMENT

## beadmin@vmi3535064:~$ cat /etc/os-release 
PRETTY_NAME="Ubuntu 24.04.4 LTS"
NAME="Ubuntu"
VERSION_ID="24.04"
VERSION="24.04.4 LTS (Noble Numbat)"
VERSION_CODENAME=noble
ID=ubuntu
ID_LIKE=debian
HOME_URL="https://www.ubuntu.com/"
SUPPORT_URL="https://help.ubuntu.com/"
BUG_REPORT_URL="https://bugs.launchpad.net/ubuntu/"
PRIVACY_POLICY_URL="https://www.ubuntu.com/legal/terms-and-policies/privacy-policy"
UBUNTU_CODENAME=noble
LOGO=ubuntu-logo

[ Public Internet / Clients ]
                                 │
                                 ▼ (Port 80 / 443)
              ┌─────────────────────────────────────┐
              │           Cloud VPS Host            │
              │  ┌───────────────────────────────┐  │
              │  │  Nginx + Certbot (SSL Term.)  │  │
              │  └───────────────┬───────────────┘  │
              │                  │ :3000            │
              │                  ▼                  │
              │  ┌───────────────────────────────┐  │
              │  │      Next.js Application      │  │
              │  │  • Frontend (Pages / App)     │  │
              │  │  • Backend BFF (/api/*)       │  │
              │  │  • OpenAPI / Swagger (/docs)  │  │
              │  └───────────────┬───────────────┘  │
              │                  │ :5432 (Internal) │
              │                  ▼                  │
              │  ┌───────────────────────────────┐  │
              │  │    PostgreSQL 16 Container    │  │
              │  │     • postgis 3.4             │  │
              │  │     • pgvector                │  │
              │  └───────────────────────────────┘  │
              └─────────────────────────────────────┘

## INSTALLATION
### POSTGRESQL
sudo apt-get install -y \
  postgresql-16 \
  postgresql-contrib-16 \
  postgresql-16-postgis-3 \
  postgresql-16-postgis-3-scripts \
  postgresql-16-pgvector

## NGINX
sudo apt-get install -y nginx certbot python3-certbot-nginx

## Certbot
sudo certbot --nginx -d 169.58.240.62.sslip.io --non-interactive --agree-tos -m admin@ngetag.com --redirect

## REPOSITORY
/home/webadmin/apps/staging/b2c-nextjs-pwa