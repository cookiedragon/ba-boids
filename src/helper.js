"use strict"

function rand(num) {
    return Math.floor(Math.random() * num)
}

function randF(num) {
    return Math.random() * num
}

function between(lower, upper) {
    return Math.floor(Math.random() * (upper - lower + 1)) + lower
}

function betweenF(lower, upper) {
    return Math.random() * (upper - lower + 1) + lower
}
