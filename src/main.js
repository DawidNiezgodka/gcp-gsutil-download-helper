const core = require('@actions/core')
const { Storage } = require('@google-cloud/storage')

async function run() {
  try {
    const storage = new Storage()
    const bucketName = core.getInput('bucket_name')
    const fileName = core.getInput('target_file_name')
    const downloadPath = core.getInput('local_download_path')

    core.debug(`Checking if file ${fileName} exists in bucket ${bucketName}.`)

    const bucket = storage.bucket(bucketName)
    const file = bucket.file(fileName)
    const [exists] = await file.exists()

    if (exists) {
      core.debug(
        `File ${fileName} exists in bucket ${bucketName}. Downloading...`
      )

      await file.download({
        destination: downloadPath
      })

      core.debug(`File ${fileName} downloaded successfully to ${downloadPath}.`)
    } else {
      core.setFailed(`File ${fileName} does not exist in bucket ${bucketName}.`)
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}
