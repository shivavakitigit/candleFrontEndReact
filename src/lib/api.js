const DEV = true
const ROOT = DEV ? "http://localhost:8080" : ""

async function isLoggedIn() {
    // get token. if there is none, it will be ""
    const token = getCookie('token')
    if (!token) return {} // this function should always return an object

    // make the API call wit hthe token on the headers
    const res = await fetch(ROOT + `/user/loggedIn/info`, {
        headers: {
            token
        }
    })

    // handle bad request
    if (!res.ok) {
        if (res.status == 404) {
            // handle user not found
            console.log(`user not found`)
        } else {
            // probably a 500
            console.log(`Check login failed: `, res)
        }
        return {}
    }

    // comment this out when the server properly returns json
    // const username = await res.text()
    // return {username}
    // end

    try {
        const user = await res.json()
        return user
    } catch (error) {
        console.log("something went wrong in isLoggedIn when trying to read the body")
        console.log(res, error)
        return {}
    }

}

async function alterInfo(data) {
    return await handleFetch('/user/alterInfo', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'token': getToken()
            },
            body: JSON.stringify(data)
    }, "alter info")
}

async function getOrders() {
    // console.log(getToken())
    return await handleFetch("/user/orderHistory", {
        headers: {
            token: getToken()
        },
        responseHandlers: {
            good: ()=>{},
            bad: res => {
                console.log("failed fetching orders")
                console.log(res)
            }
        },
        logging: "Attempting to get orders"
    }, "get orders")
}

function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

function getToken() {
    return getCookie('token')
}

async function handleFetch(endpoint, options = {}, routeName, textResponse) {
    const res = await fetch(ROOT + endpoint, options)
    if (options.responseHandlers) {
        options.responseHandlers[res.ok ? 'good' : 'bad'](res)
    }
    if (options.logging) {
        console.log(options.logging)
    }
    if (!res.ok) {
        console.log(`
            Error fetching from ${endpoint}
            Route: ${routeName}
        `)
        console.log(res)
        return
    }
    const data = await res[
        textResponse ? 'text' : 'json'
    ]()
    return data
}

async function getAllProducts(limit = 3) {
    const data = await handleFetch(`/products/available?limit=${limit}`, {}, "Get all products")
    return data
}

// example:     getProductsByIds([1, 2, 3])
async function getProductsByIds(ids) {
    const data = await handleFetch(`/products/ids`, {
        method: 'POST',
        body: JSON.stringify(ids),
        headers: {
            "Content-Type": "application/json"
        }
    }, "get Prodcuts by IDs")
    return data
}

async function signOutUser() {
    const res = await fetch(ROOT+'/user/signOut', {
        method: "DELETE",
        headers: {
            "x-auth-token": getCookie('token')
        }
    })
    if (res.ok) {
        document.cookie = ""
        location.reload()
    } else {
        console.log(res)
    }
}

async function createOrder() {
    
}

async function changePassword(oldPassword, newPassword, responseHandlers) {
    return await handleFetch(`/change/password`, {
        method: 'POST',
        headers: {
            oldPassword,
            newPassword,
            token: getToken()
        },
        responseHandlers
    }, 'change password', true)
}

async function signUpUser(data) {
    return await handleFetch('/user/signUp', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    }, 'sign up', true)
}



export {
    getAllProducts,
    getProductsByIds,
    signOutUser,
    isLoggedIn,
    ROOT,
    getCookie,
    getToken,
    alterInfo,
    getOrders,
    changePassword,
    signUpUser
}