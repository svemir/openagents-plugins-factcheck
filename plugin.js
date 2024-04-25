
function run() {
  const inputs = JSON.parse(Host.inputString())
  // Ignore special characters in the original statement
  const statement = inputs.statement.replace(/[^\w ]/, '')
  const encodedStatement = encodeURI(statement)
  const apiKey = inputs.key
  const apiHost = 'https://factchecktools.googleapis.com'
  const apiUrl = `${apiHost}/v1alpha1/claims:search?query=${encodedStatement}&key=${apiKey}`

  const request = {
    method: "GET",
    url: apiUrl,
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0"
    }
  }

  const response = Http.request(request)

  if (response.status !== 200) {
    const errorMessage = `Error ${response.status}: ${response.statusText}`
    Host.outputString(errorMessage)
    throw new Error(errorMessage)
  }

  const data = JSON.parse(response.body)
  let result = {
    claim: inputs.statement,
    rating: 'Unknown',
    title: '',
    source: ''
  }
  if (data && data.claims) {
    let originalClaimMatched = false
    data.claims.forEach((claim) => {
      // Use the top review unless a better matching claim is found on the first page
      let claimMatched = (claim.text.toLowerCase().replace(/[^\w ]/, '') === statement.toLowerCase())
      if (result.rating === 'Unknown' || (!originalClaimMatched && claimMatched)) {
        result.claim = claim.text
        result.rating = claim.claimReview[0].textualRating
        result.title = claim.claimReview[0].title
        result.source = claim.claimReview[0].url
        originalClaimMatched = claimMatched
      }
    })
  }

  const resultString = JSON.stringify(result)
  Host.outputString(resultString)
}

module.exports = { run }