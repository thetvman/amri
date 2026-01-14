param(
  [string]$ProjectPath = (Get-Location).Path
)

Set-Location $ProjectPath

if (!(Test-Path ".env.local")) {
  Write-Host "Creating .env.local..."
  $tmdb = Read-Host "TMDB_API_KEY"
  $secret = Read-Host "NEXTAUTH_SECRET"
  $adminEmail = Read-Host "ADMIN_EMAIL"
  $adminPassword = Read-Host "ADMIN_PASSWORD"

  @"
TMDB_API_KEY=$tmdb
NEXTAUTH_SECRET=$secret
DATABASE_URL="file:./dev.db"
ADMIN_EMAIL=$adminEmail
ADMIN_PASSWORD=$adminPassword
"@ | Set-Content ".env.local"
}

Write-Host "Installing dependencies..."
npm install

Write-Host "Setting up database..."
npm run prisma:generate
npm run prisma:push
npm run seed:admin

Write-Host "Setup complete. Run: npm run dev"
