import { lucide } from '../icons.js'
import { HOST, GET_IMAGE_URL } from '../env.js'


$(document).ready(async function () {
    var BASE_URL = HOST + "/api/Information";
    var infor = [];
    var RECORD_ID = 0;
    //GET TOKEN
    var accessToken = $.cookie('AccessToken');


   
    await getInfor();
    
    //DATA RENDERING
    async function getInfor() {
        try {
            const res = await $.ajax({
                url: BASE_URL,
                type: "GET",
                contentType: "application/json",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                beforeSend: function () {
                    $(".loading").css("display", "block");
                    $(".main-content").css("display", "none");
                }
            });
            if (res) {
                await renderData(res);
                $(".loading").css("display", "none");
                $(".main-content").css("display", "block");
            }
        } catch (e) {
            $(".main-layout").css("display", "none");
            $(".notfound").css("display", "block");
        }

    }

    async function renderData(res) {
        const imgSrc = GET_IMAGE_URL + res.logo;
        $("#inforName").text(res.name);
        $("#inforSlogon").text(res.slogon);
        $("#inforFacebook").text(res.facebook);
        $("#inforInstar").text(res.instar);
        $("#inforTwitter").text(res.twister);
        $("#inforYoutube").text(res.youtube);
        $("#inforAddress").text(res.address);
        $("#inforPhone").text(res.phoneNumber);
        $("#inforMail").text(res.email);
        $("#inforWeb").text(res.site);
        $("#inforLogo").prop("src", imgSrc)
        $("#facebook").val(res.facebookLink);
        $("#instagram").val(res.instarLink);
        $("#twitter").val(res.twisterLink);
        $("#youtube").val(res.youtubeLink);

        $("#phoneNumber").val(res.phoneNumber);
        $("#email").val(res.email);
        $("#website").val(res.site);
        $("#address").val(res.address);
        $("#googleMap").val(res.googleMapLink);
        $(".gg-map").prop("src", res.googleMapLink)
    


    }



});