// src/js/share.js

export function generateShareLinks(term) {
  const baseUrl = window.location.origin;
  const shareUrl = encodeURIComponent(`${baseUrl}?term=${term}`);
  const shareText = encodeURIComponent(`Check out this explanation of "${term}" on Tech Decoded!`);

  const twitter = document.getElementById("twitterShare");
  const facebook = document.getElementById("facebookShare");
  const reddit = document.getElementById("redditShare");
  const shareSection = document.getElementById("shareButtons");

  if (twitter && facebook && reddit) {
    twitter.href = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`;
    facebook.href = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
    reddit.href = `https://www.reddit.com/submit?url=${shareUrl}&title=${shareText}`;
  }

  if (shareSection) {
    shareSection.classList.remove("hidden");
  }
}
