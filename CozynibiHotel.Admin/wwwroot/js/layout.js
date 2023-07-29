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

    //NOTIFICATIONS
    const GET_NOTIFICATION_CONTACT = HOST + "/api/Contact";
    const GET_NOTIFICATION_BOOKING = HOST + "/api/Booking";
    const GET_NOTIFICATION_FOODORDER = HOST + "/api/FoodOrder";
    var noticeList = [];

    await getAllNotification();

    async function getAllNotification() {
        
        $(".notification-content__box .notice-item").remove();
        await getNotification(GET_NOTIFICATION_BOOKING, "bell.png", "Booking");
        await getNotification(GET_NOTIFICATION_CONTACT, "user/user4.png", "Contact");
        await getNotification(GET_NOTIFICATION_FOODORDER, "foodOrder.png", "FoodOrder");
        
    }
  
    async function getNotification(URL, IMG, TYPE) {
        try {
            const res = await $.ajax({
                url: URL,
                type: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            if (res && res.length != 0) {
                noticeList = [];
                for (var i = 0; i < res.length; i++) {
                    if (TYPE =="Contact"&&res[i].isActive == true) {
                        noticeList.push(res[i]);
                    }
                    else if (TYPE == "Booking" && res[i].isConfirm != true) {
                        noticeList.push(res[i]);
                    }
                    else if (TYPE == "FoodOrder" && res[i].isActive != true) {
                        noticeList.push(res[i]);
                    }
                }
            }
            renderNotification(noticeList, IMG, TYPE);
            
        } catch (e) {
            console.log(e);
        }
    }

    function renderNotification(notice, IMG, TYPE) {
        if (notice.length != 0) $(".notification").addClass("notification--bullet");
        var htmlNotification = ``;
        let imageContact = GET_IMAGE_URL + IMG;
        for (var i = 0; i < notice.length; i++) {
            htmlNotification += `
			<div class="cursor-pointer relative flex items-center mt-5 notice-item notice-item-notice noctice-${TYPE}">
                <div class="w-12 h-12 flex-none image-fit mr-1">
                    <img alt="" class="rounded-full"
                        src="${imageContact}">
                    <div
                        class="w-3 h-3 bg-success absolute right-0 bottom-0 rounded-full border-2 border-white">
                    </div>
                </div>
                <div class="ml-2 overflow-hidden">
                    <div class="flex items-center">
                        <a href="javascript:;" class="font-medium truncate mr-5">New ${TYPE}</a>
                        <div class="text-xs text-slate-400 ml-auto whitespace-nowrap">${notice[i].createdAt}</div>
                    </div>
                    <div class="w-full truncate text-slate-500 mt-0.5">
                        Custommer: ${notice[i].fullName}, ${notice[i].phoneNumber}, ${TYPE =="FoodOrder"?notice[i].place:notice[i].email}
                    </div>
                </div>
            </div>
		`;
        }

        
 
        $(".notification-content__box").append(htmlNotification);
        $(`.noctice-${TYPE}`).click(function () {
            if (TYPE == "FoodOrder") {
                window.location.href = "/Admin/Menu/" + TYPE;
            }
            else{
                window.location.href = "/Admin/ContactAndBooking/" + TYPE;
            }
            
        });

    }

   

});