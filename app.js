function id(name) {
  return document.getElementById(name.slice(1))
}

function forEach(list, fn) {
  if (typeof list.forEach == "function") return list.forEach(fn)
  for (var i = 0; i < list.length; i++) {
    if (fn(list[i], i) === false) break
  }
}

function matches(el, selector) {
  return el.matches(selector)
}

function closest(el, selector) {
  while (el && !matches(el, selector)) el = el.parentNode
  return el
}

function mode(el, classname) {
  var toRemove = []
  forEach(el.classList, function(name) {
    if (/^mode-/.test(name) && name != classname) toRemove.push(name)
  })
  forEach(toRemove, function(name) {
    el.classList.remove(name)
  })
  el.classList.add(classname)
}

function update(_, hash) {
  if (hash) {
    var value = hash.slice(1)
    if (/\bgithub\.io\b/.test(value)) {
      var parts = value.split("/", 2)
      id("#username").value = parts[0].replace(".github.io", "")
      id("#project").value = parts[1] || ""
      document.querySelector("input[name=type][value=updateForGithub]").checked = true
    } else {
      id("#domain").value = value
      document.querySelector("input[name=type][value=updateForCustom]").checked = true
    }
  }

  forEach(document.querySelectorAll("input[name=type]"), function(radio) {
    var item = closest(radio, "li")
    item.classList.toggle("selected", radio.checked)
    if (radio.checked) window[radio.value]()
  })
}

function replaceState(hash) {
  if (window.location.protocol == "file:") {
    window.location.hash = hash
  } else {
    window.history.replaceState(null, "", "#" + hash)
  }
}

function updateForGithub() {
  mode(document.body, "mode-github")

  var username = id("#username").value
  var project = id("#project").value
  var location = username + ".github.io"
  if (project) location += "/" + project + "/"
  replaceState(location)
  location = "http://" + location

  var container = id("#github")
  container.querySelector(".location").textContent = location
  if (project) {
    container.querySelector(".repo-name").textContent = project
    container.querySelector(".branch-name").textContent = "gh-pages"
  } else {
    container.querySelector(".repo-name").textContent = username + ".github.io"
    container.querySelector(".branch-name").textContent = "master"
  }
}

function updateForCustom() {
  mode(document.body, "mode-custom")
  var domainField = id("#domain")
  var domain = domainField.value || domainField.getAttribute("placeholder")
  replaceState(domain)
  var location = "http://" + domain

  var domainParts = domain.split(".")
  // TODO: https://en.wikipedia.org/wiki/Second-level_domain
  while (domainParts.length > 2) domainParts.shift()
  var apexDomain = domainParts.join(".")

  var container = id("#custom")
  mode(container, apexDomain == domain ? "mode-apex" : "mode-subdomain")
  if (domain == "www." + apexDomain) {
    container.classList.add("mode-www")
  }

  container.querySelector(".location").textContent = location
  forEach(container.querySelectorAll(".domain-name"), function(el) {
    el.textContent = domain
  })
  forEach(container.querySelectorAll(".apex-domain-name"), function(el) {
    el.textContent = apexDomain
  })
}

document.addEventListener("change", update, false)
document.addEventListener("input", update, false)

document.addEventListener("focusin", function(event) {
  if (event.target.type == "text") event.target.select()
}, false)

update(null, window.location.hash)
