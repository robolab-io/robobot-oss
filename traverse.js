const fs = require('fs')
const path = require('path')


exports.traverse = ( entries, cb ) => {
  entries.forEach((entryPath) => {
    searchDirectory(entryPath, cb);
  })
}


function searchDirectory(directoryPath, cb) {
  const indexPath = path.join(directoryPath, 'index.js')

  // If a dir includes `index.js` file, run a given callback on it,
  // but do not traverse any deeper.
  if (fs.existsSync(indexPath)) {
    cb(indexPath)
  }
  
  // If there is no `index.js`file, run a given callback on all `.js` 
  // files present and traverse deeper if there are directories.
  else {
    let dirItems = fs.readdirSync(directoryPath)
    if (dirItems) for (let file of dirItems) {
      const filePath = path.join(__dirname, directoryPath, file);
      if (fs.statSync(filePath).isDirectory()) {
        searchDirectory(filePath, cb)
      } else if (file.endsWith('.js')) {
        cb(filePath)
      }
    }
  }
}
