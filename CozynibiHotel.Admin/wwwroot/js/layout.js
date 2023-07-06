import jwt_decode from 'https://cdn.jsdelivr.net/npm/jwt-decode@3.1.2/+esm'
import { HOST, GET_IMAGE_URL } from './env.js'

$(document).ready(async function () {
    const currentPathname = window.location.pathname;
    const pathArray = currentPathname.split('/');
    pathArray[1] = "Cozynibi Hotel";
    console.log(pathArray);

    var thumbHtml = `<li class="breadcrumb-item"><a href="/Admin">${pathArray[1]}</a></li>`;

    for (var i = 2; i < pathArray.length; i++) {
        if (pathArray[i] == "" || pathArray[i] == null) break;
        
        var url = "/Admin";
        for (var j = 2; j <= i; j++) {
            url += `/${pathArray[j]}`;
        }
        if (i == pathArray.length - 1) {
            thumbHtml += `
            <li class="breadcrumb-item active" aria-current="page">${pathArray[i]}</li>`
            continue;
        }
        if (i == 4) {
            thumbHtml += `
            <li class="breadcrumb-item active" aria-current="page">${pathArray[i]}</li>`
            break;
        };
        thumbHtml += `
            <li class="breadcrumb-item"><a href="${url}">${pathArray[i]}</a></li>
        `;
    }
    $(".road-thumbnail .breadcrumb").append(thumbHtml);

    //GET TOKEN
    var accessToken = $.cookie('AccessToken');
    var decoded = jwt_decode(accessToken);
    

    const USER_ID = decoded.Id;

    const GET_USER = HOST + "/api/Account/" + USER_ID;
    console.log(USER_ID);

    //USER INFOR
    const USER_INFOR = await getUser();
    const USER_AVATAR = GET_IMAGE_URL + `user/${USER_INFOR.username}/` + USER_INFOR.avatar;

    const GET_ROLE = HOST + "/api/Account/Role/" + USER_INFOR.roleId;

    const ROLE = await getRole();

    async function getUser() {
        try {
            const res = await $.ajax({
                url: GET_USER,
                type: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            if (res) {
                return res;
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    async function getRole() {
        try {
            const res = await $.ajax({
                url: GET_ROLE,
                type: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            if (res) {
                return res;
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    console.log(USER_INFOR);

    
    $(".user-fullname").text(USER_INFOR.fullName);
    $(".user-role").text(ROLE.name);

    function checkImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(url);
            img.onerror = () => reject(url);
            img.src = url;
        });
    }

    checkImage(USER_AVATAR)
        .then(url => {
            $(".user-avatar").prop("src", url);
        })
        .catch(() => {
            $(".user-avatar").prop("src", GET_IMAGE_URL + "user/user.png");
        });

   

   

});