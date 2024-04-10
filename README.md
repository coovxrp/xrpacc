# xrpacc

from ./, node issuerSnapshot.js will save holder list for each issuer in ./data\_{issuer}.json
./ node getOwners.js will save ownerAddress, issuerAddress, QTY held ans cave in owners_data.csv, then filter for unique owner addresses and total qty
./ node filter.js will filter for only holders of >= 300
