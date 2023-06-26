import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import BigNumber from 'bignumber.js';

const CryptoJS = require('crypto-js');

const log = console.log
const warn = console.warn
const error = console.error
const tab = "	";
const enter = "\n";

function encryptString(content = "", password = "Secret Passphrase") {
    return CryptoJS.AES.encrypt(content, password).toString();
}

function decryptString(ciphertext = "", password = "Secret Passphrase") {
    return CryptoJS.AES.decrypt(ciphertext, password).toString(CryptoJS.enc.Utf8);
}

function copyText(text, callback) {
    try {
        const input = document.createElement('input');
        input.setAttribute('readonly', 'readonly');
        input.setAttribute('value', text);
        document.body.appendChild(input);
        input.setSelectionRange(0, 9999);
        if (document.execCommand('copy')) {
            document.execCommand('copy');
            if (callback) {
                callback();
            }
        }
        document.body.removeChild(input);
    } catch (e) {
        toast(e);
    }
}

function randomString(e) {
    e = e || 32;
    var t = "ABCDEFGHIZKLMNOPQRSTWXYZabcdefhijkmnprstwxyz2345678",
        a = t.length,
        n = "";
    for (let i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
    return n
}

function randomNum(Min, Max) {
    var Range = Max - Min;
    var Rand = Math.random();
    return (Min + Math.round(Rand * Range));
}

function getTimeString(time) {
    //var date = new Date(time);
    var date = new Date(time * 1000);
    var year = date.getFullYear() + '-';
    var month = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    var dates = date.getDate() + ' ';
    var hour = date.getHours() + ':';
    var min = date.getMinutes() + ':';
    var second = date.getSeconds();
    return year + month + dates + hour + min + second;
}

function getDomainName(hostName) {
    return hostName.substring(hostName.lastIndexOf(".", hostName.lastIndexOf(".") - 1) + 1);
}

function getShortAddress(address = "0x", start = 0, end = 3) {
    return address.slice(0, start) + ".." + address.slice(address.length - end - 1)
}

function cropLongString(string = "") {
    return string.substring(0, 4) + " ... " + string.substring(string.length - 3)
}

function getOS() {
    var userAgent = window.navigator.userAgent,
        platform = window.navigator?.userAgentData?.platform || window.navigator.platform,
        macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
        windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
        iosPlatforms = ['iPhone', 'iPad', 'iPod'],
        os = null;

    if (macosPlatforms.indexOf(platform) !== -1) {
        os = 'Mac OS';
    } else if (iosPlatforms.indexOf(platform) !== -1) {
        os = 'iOS';
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
        os = 'Windows';
    } else if (/Android/.test(userAgent)) {
        os = 'Android';
    } else if (/Linux/.test(platform)) {
        os = 'Linux';
    }

    return os;
}

function hash(input) {
    return CryptoJS.SHA256('sha256').update(input).digest('hex');
}

function isUrl(url) {
    try {
        new URL(url)
        return true
    } catch (error) {
        return false;
    }
}

/**
 * tạo ngẫu nhiên 1 số trong khoảng min - max
 * @param {float} min 
 * @param {float} max 
 * @param {int} decimals số thập phân sau dấu chấm
 * @returns {float}
 */
function getRandomFloat(min, max, decimals) {
    min = parseFloat(min)
    max = parseFloat(max)

    if (min > max) {
        let m = max
        max = min
        min = m
    }
    if (!decimals) {
        let min_d = 0, max_d = 0;

        try { min_d = min.toString().split(".")[1].length } catch (error) { }
        try { max_d = max.toString().split(".")[1].length } catch (error) { }

        decimals = min_d > max_d ? min_d : max_d;
    }
    const str = (Math.random() * (max - min) + min).toFixed(decimals);
    return parseFloat(str);
}

/**
 * chuyển số BigNumber thành số đơn vị thập phân, rút gọn số thập phân 4, xóa các số 0 ở cuối
 * @param {string || number} number số đầu vào
 * @param {string || number} decimals số thập phân
 * @returns {number} 
 */
function BNToNumber(number, decimals = 18) {
    let _number = new BigNumber(number)
    let _decimals = (new BigNumber(10)).pow(decimals)
    return _number.div(_decimals)
}

/**
 * tạo số BigNumber: 10^18
 * @param {int} decimals số thập phân
 * @returns {BigNumber}
 */
function TenPower(decimals = 18) {
    return new BigNumber(10).pow(decimals)
}

export { getShortAddress, tab, enter, BNToNumber, TenPower, log, warn, error, encryptString, decryptString, copyText, randomNum, getTimeString, getDomainName, getOS, cropLongString, hash, isUrl, getRandomFloat }
