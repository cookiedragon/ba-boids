"use strict"

function rand(num) {
    return Math.floor(Math.random() * num)
}

function between(lower, upper) {
    return Math.floor(Math.random() * (upper - lower + 1)) + lower
}
