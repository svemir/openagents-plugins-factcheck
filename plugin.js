
function run() {
  const inputs = JSON.parse(Host.inputString())
  const data = fetchReviews(inputs)

  let result = {
    claim: inputs.statement,
    rating: 'Unknown',
    title: '',
    source: '',
    allRatings: {},
    overallRating: 'Unknown'
  }

  if (data && data.claims) {
    let cleanStatement = inputs.statement.replace(/[^\w ]/, '').toLowerCase()
    let originalClaimMatched = false
    let maxRatingCount = 1
    data.claims.forEach((claim) => {
      // Use the top review unless a better matching claim is found on the first page
      let claimMatched = (claim.text.replace(/[^\w ]/, '').toLowerCase() === cleanStatement)
      if (result.rating === 'Unknown' || (!originalClaimMatched && claimMatched)) {
        setResultDetails(result, claim)
        originalClaimMatched = claimMatched
      }
      tallyRatings(claim.claimReview, result, maxRatingCount)
    })
  }
  result.allRatings = Object.keys(result.allRatings)

  const resultString = JSON.stringify(result)
  Host.outputString(resultString)
}

function fetchReviews(inputs)
{
  const encodedStatement = encodeURI(inputs.statement)
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

  return JSON.parse(response.body)
}

function setResultDetails(result, claim) {
  result.claim = claim.text
  result.rating = claim.claimReview[0].textualRating
  result.title = claim.claimReview[0].title
  result.source = claim.claimReview[0].url
  result.overallRating = result.rating
}

// Store distinct ratings and set overall rating based on what is most common
function tallyRatings(reviews, result, maxRatingCount) {
  reviews.forEach((review) => {
    const rating = review.textualRating
    if (result.allRatings[rating]) {
      result.allRatings[rating]++
      if (result.allRatings[rating] > maxRatingCount) {
        maxRatingCount = result.allRatings[rating]
        result.overallRating = rating
      }
    } else {
      result.allRatings[rating] = 1
    }
  })
}

module.exports = { run }
