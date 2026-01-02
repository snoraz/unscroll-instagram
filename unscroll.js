let hideHome = false;

let isHomepage = false;
let isFollowingpage = false;
let isSearchpage = false;
let isReelspage = false;
let redirected = false;

let updateSettings = () => {
    let currentURL = window.location.href;
    isHomepage = /^https:\/\/www\.instagram\.com\/?$/.test(currentURL) || currentURL.includes("/?variant=home");
    isFollowingpage = currentURL.includes("variant=following");
    isSearchpage = currentURL.includes("/explore/");
    isReelspage = currentURL.includes("/reels/");
}
updateSettings();


// Retrieve user settings from storage
browser.storage.sync.get(["hideHome"]).then(settings => {
    hideHome = settings.hideHome ?? false;
});


let remReelsButton = () => {
    let reelsLink = document.querySelector('div[href="/reels/"]');
    if (!reelsLink) {
        return
    }
    let container = reelsLink.parentElement?.parentElement?.parentElement;
    if (container) {
        container.remove();
    } else {
        reelsLink.remove();
    }
}

let remExploreButton = () => {
    let exploreLink = document.querySelector('a[href="/explore/"]');
    if (!exploreLink) {
        return
    }
    let exploreContainer = exploreLink.parentElement?.parentElement?.parentElement;
    if (exploreContainer) {
        exploreContainer.remove();
    } else {
        exploreLink.remove();
    }
}

let remReturnHome = () => {
    let returnHome = document.querySelector('div[class="html-div xdj266r x14z9mp x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x9f619 xjbqb8w x78zum5 x15mokao x1ga7v0g x16uus16 xbiv7yw x1yztbdb x1uhb9sk x1plvlek xryxfnj x1c4vz4f x2lah0s xdt5ytf xqjyukv x1qjc9v5 x1oa3qoh x1nhvcw1"]');
    if (!returnHome) {
        return
    }
    returnHome.remove();
}

let redirectHomeLink = () => {
    let homeLinks = document.querySelectorAll('a[href="/"]');
    if (!homeLinks) {
        return
    }
    for (let i = 0; i < homeLinks.length; i++) {
        homeLinks[i].setAttribute("href", "/?variant=following");
    } 
}

let remExplorePosts = () => {
    if (isSearchpage) {
        const loader = document.querySelector('svg[aria-label="Loading..."]');
        if (loader) {
            loader.parentElement.remove();
        }
        let proposedPosts = document.querySelectorAll('a[href*="/p/"]');
        if (!proposedPosts) {
            return
        }
        proposedPosts.forEach(function (link) {
            link.remove();
        });
    }
}

let remHomeButton = () => {
    const homeLink = document.querySelectorAll('svg[aria-label="Home"]');
    const homeLinkElement = homeLink[homeLink.length - 1]?.closest('a');
    if (!homeLink.length) {
        return;
    }
    let container = homeLinkElement.parentElement?.parentElement?.parentElement?.parentElement;
    if (container) {
        container.remove();
    } else {
        homeLink.remove();
    }
}

let remSuggestedFollowers = () => {
    const suggestedTitle = [...document.querySelectorAll('span')]
        .find(el => el.textContent.trim() === 'Suggested for you');

    const suggestedContainer = suggestedTitle?.closest('div').parentElement?.parentElement;
    if (suggestedContainer) {
        suggestedContainer.remove();
    }
}

let forwardToMessagesPage = () => {
    window.location.assign('https://www.instagram.com/direct/inbox/');
}

// forward to "following" page to avoid seeing posts of people you don't follow
let forwardToFollowingPage = () => {
    window.location.assign('https://www.instagram.com/?variant=following');
}

let onPageUpdate = () => {
    updateSettings();

    if (!redirected) {
        if (isReelspage) {
            redirected = true;
            if (hideHome) {
                forwardToMessagesPage();
            } else {
                forwardToFollowingPage();
            }
            return;
        }

        if (isHomepage && hideHome) {
            redirected = true;
            forwardToMessagesPage()
            return;
        }

        if (isHomepage) {
            redirected = true;
            forwardToFollowingPage();
            return;
        }
    }

    if (hideHome) remHomeButton();

    remReelsButton();
    remExploreButton();
    remReturnHome();
    redirectHomeLink();
    //remExplorePosts();
    remSuggestedFollowers();
};

let updateTimeout;
let observer = new MutationObserver(function () {
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(onPageUpdate, 100);
});

// Start observing the body for changes
observer.observe(document.body, {childList: true, subtree: true, attributes: true});

// reset redirected flag on navigation events
window.addEventListener("popstate", () => redirected = false);
window.addEventListener("pushstate", () => redirected = false);
window.addEventListener("replacestate", () => redirected = false);


// initial run
onPageUpdate();

console.log("Unscroll active");
