function userInformationHTML(user) {
  return `
    <h2>${user.name || ""}
      <span class="small-name">
        (@<a href="${user.html_url}" target="_blank">${user.login}</a>)
      </span>
    </h2>
    <div class="gh-content">
      <div class="gh-avatar">
        <a href="${user.html_url}" target="_blank">
          <img src="${user.avatar_url}" width="80" height="80" alt="${user.login}"/>
        </a>
      </div>
      <p>Followers: ${user.followers} - Following: ${user.following} <br> 
         Public Repos: ${user.public_repos}</p>
    </div>`;
}

function renderDropdown(title, repos) {
  if (repos.length === 0) {
    return `<p>No ${title} found.</p>`;
  }

  let listItemsHTML = repos.map(repo => {
    return `
      <a class="dropdown-item" href="${repo.html_url}" target="_blank">
        ${repo.name}
      </a>`;
  }).join("\n");

  return `
    <div class="dropdown d-inline-block mx-2 w-100">
      <button class="btn btn-primary dropdown-toggle mb-2 w-100" type="button" 
              id="${title.replace(/\s+/g, '-')}-dropdown" data-toggle="dropdown" 
              aria-haspopup="true" aria-expanded="false">
        ${title}
      </button>
      <div class="dropdown-menu w-100" aria-labelledby="${title.replace(/\s+/g, '-')}-dropdown">
        ${listItemsHTML}
      </div>
    </div>`;
}

function repoInformationHTML(repoData) {
  // separate portfolio/personal
  var portfolioRepos = repoData.filter(repo =>
    repo.topics && repo.topics.includes("portfolio")
  );
  var personalRepos = repoData.filter(repo =>
    repo.topics && repo.topics.includes("personal")
  );

  // if topics exist, show dropdowns (double check when limit lifted)
  if (portfolioRepos.length > 0 || personalRepos.length > 0) {
    return `
      <div class="row justify-content-center mt-3">
        <div class="col-sm-6 col-md-4 text-center">
          ${renderDropdown("Portfolio Projects", portfolioRepos)}
        </div>
        <div class="col-sm-6 col-md-4 text-center">
            ${renderDropdown("Personal Projects", personalRepos)}        
        </div>
      </div>`;
  }

  // fallback → show all repos in a list
  let listItemsHTML = repoData.map(repo => {
    return `
    <div class="col-6 com-md-4 mb-3">
        <div class="card h-100 shadow-sm">
            <div class="card-body text-center">
                <h6 class="card-title">${repo.name}</h6>
                <button class="btn btn-primary btn-sm" onclick="window.open('${repo.html_url}','_blank')">
                View Repo
                </button>
            </div>
        </div>        
    </div>`;
  }).join("\n");

  return `
    <div class="clearfix repo-list mt-3">
      <p><strong>Repos:</strong></p>
      <div class="row">
      ${listItemsHTML}
      </div>
    </div>`;
}

function fetchGitHubInformation() {
  $("#gh-user-data").html("");
  $("#gh-repo-data").html("");

  var username = $("#gh-username").val();
  if (!username) {
    $("#gh-user-data").html(`<h2>Please enter a GitHub username</h2>`);
    return;
  }

  $("#gh-user-data").html(
    `<div id="loader">
      <img src="assets/css/loader.gif" alt="loading..." />
    </div>`
  );

  $.when(
    $.getJSON(`https://api.github.com/users/${username}`),
    $.getJSON(`https://api.github.com/users/${username}/repos?per_page=100`)
  ).then(
    function(firstResponse, secondResponse) {
      var userData = firstResponse[0];
      var repoData = secondResponse[0];

      $("#gh-user-data").html(userInformationHTML(userData));
      $("#gh-repo-data").html(repoInformationHTML(repoData));
    },
    function(errorResponse) {
      if (errorResponse.status === 404) {
        $("#gh-user-data").html(`<h2>No info found for user ${username}</h2>`);
      } else if (errorResponse.status === 403) {
        var resetTime = new Date(errorResponse.getResponseHeader("X-RateLimit-Reset") * 1000);
        $("#gh-user-data").html(
          `<h4>Too many requests, please wait until ${resetTime.toLocaleTimeString()}</h4>`
        );
      } else {
        console.log(errorResponse);
        $("#gh-user-data").html(
          `<h2>Error: ${errorResponse.responseJSON.message}</h2>`
        );
      }
    }
  );
}

$(document).ready(fetchGitHubInformation);