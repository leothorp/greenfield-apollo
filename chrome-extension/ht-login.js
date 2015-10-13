// This should run once (maybe on login) and save to more persistent storage
// TODO: ^^^^^^
function doStuff() {
  chrome.runtime.sendMessage({creds:window.localStorage.habit_token},null);
}
window.addEventListener('load', function load() {
  window.removeEventListener('load',load,false);
  doStuff();
},false);
