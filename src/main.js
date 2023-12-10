const core = require('@actions/core')
const { Storage } = require('@google-cloud/storage')
const path = require("path");
const fs = require("fs");

async function run() {
  try {
    const storage = new Storage()
    const bucketName = core.getInput('bucket_name')
    const targetFile = core.getInput('target_file')
    const targetFolder = core.getInput('target_folder')
    const downloadPath = core.getInput('local_download_path')
``
    // if targetFile is provided, then we download a single file from bucket
    if (targetFile) {
      core.debug(`Checking if file ${targetFile} exists in bucket ${bucketName}.`)

      const bucket = storage.bucket(bucketName)
      const file = bucket.file(targetFile)

      const [exists] = await file.exists()

      if (exists) {
        core.debug(
            `File ${targetFile} exists in bucket ${bucketName}. Downloading...`
        )

        await file.download({
          destination: downloadPath
        })
        core.debug(`File ${targetFile} downloaded successfully to ${downloadPath}.`)
    }  else {
        core.setFailed(`File ${targetFile} does not exist in bucket ${bucketName}.`)
      }
    }

    // if targetFolder is provided, then we download all files from bucket
    if (targetFolder) {

      core.debug(`Checking if download path ${downloadPath} exists.`)
      try {
        if (!fs.existsSync(downloadPath)) {
          core.info("Creating directory: " + downloadPath)
          fs.mkdirSync(downloadPath);
        }
      } catch (err) {
        console.error(err);
      }

      const bucket = storage.bucket(bucketName)
      const [files] = await bucket.getFiles({
        prefix: targetFolder
      })

      core.debug(`Checking if folder ${targetFolder} exists in bucket ${bucketName}.`)
      if (files.length > 0) {
        core.debug(
            `Folder ${targetFolder} exists in bucket ${bucketName}. Downloading...`
        )

        for (const file of files) {
          const fileName = file.name.slice(
              file.name.lastIndexOf('/') + 1
          )
          core.debug(`fileName: ${fileName}`)
          const tempPath = path.join(downloadPath, fileName)
          try {
            await file.download({
              destination: `${tempPath}`
            })
            core.debug(`Folder ${targetFolder} downloaded successfully to ${downloadPath}.`)
          } catch (e) {
            core.debug(`Error downloading the file at ${targetFolder}/${fileName}`)
            core.debug(e)
          }
        }

      } else {
        core.setFailed(`Folder ${targetFolder} does not exist in bucket ${bucketName}.`)
      }
    }

  } catch (error) {
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}
