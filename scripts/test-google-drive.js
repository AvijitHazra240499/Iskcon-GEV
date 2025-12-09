// Test Google Drive credentials
require('dotenv').config({ path: '.env.local' })
const { google } = require('googleapis')

async function testCredentials() {
  console.log('Testing Google Drive credentials...\n')
  
  // Check if env vars exist
  console.log('1. Checking environment variables:')
  console.log('   GOOGLE_DRIVE_CLIENT_EMAIL:', process.env.GOOGLE_DRIVE_CLIENT_EMAIL ? '✓ Set' : '✗ Missing')
  console.log('   GOOGLE_DRIVE_PRIVATE_KEY:', process.env.GOOGLE_DRIVE_PRIVATE_KEY ? '✓ Set' : '✗ Missing')
  console.log('   GOOGLE_DRIVE_FOLDER_ID:', process.env.GOOGLE_DRIVE_FOLDER_ID ? '✓ Set' : '✗ Missing')
  console.log()

  if (!process.env.GOOGLE_DRIVE_CLIENT_EMAIL || !process.env.GOOGLE_DRIVE_PRIVATE_KEY) {
    console.error('❌ Missing required environment variables')
    return
  }

  // Check email format
  console.log('2. Validating client email format:')
  const emailPattern = /^.+@.+\.iam\.gserviceaccount\.com$/
  if (emailPattern.test(process.env.GOOGLE_DRIVE_CLIENT_EMAIL)) {
    console.log('   ✓ Email format looks correct')
  } else {
    console.log('   ✗ Email format may be incorrect')
    console.log('   Expected: something@project-name.iam.gserviceaccount.com')
    console.log('   Got:', process.env.GOOGLE_DRIVE_CLIENT_EMAIL)
  }
  console.log()

  // Check private key format
  console.log('3. Validating private key format:')
  const privateKey = process.env.GOOGLE_DRIVE_PRIVATE_KEY
  if (privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    console.log('   ✓ Has BEGIN marker')
  } else {
    console.log('   ✗ Missing BEGIN marker')
  }
  if (privateKey.includes('-----END PRIVATE KEY-----')) {
    console.log('   ✓ Has END marker')
  } else {
    console.log('   ✗ Missing END marker')
  }
  console.log()

  // Try to authenticate
  console.log('4. Testing authentication:')
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    })

    const authClient = await auth.getClient()
    console.log('   ✓ Authentication successful!')
    console.log()

    // Try to access Drive
    console.log('5. Testing Drive API access:')
    const drive = google.drive({ version: 'v3', auth })
    const response = await drive.files.list({
      pageSize: 1,
      fields: 'files(id, name)',
    })
    console.log('   ✓ Drive API access successful!')
    console.log()

    console.log('✅ All tests passed! Your credentials are working correctly.')
  } catch (error) {
    console.error('   ✗ Authentication failed:', error.message)
    console.log()
    console.log('Common issues:')
    console.log('- Make sure the private key has \\n characters (not actual newlines)')
    console.log('- Verify the service account exists in Google Cloud Console')
    console.log('- Check that the Google Drive API is enabled')
    console.log('- Ensure the credentials are from the correct project')
  }
}

testCredentials()
