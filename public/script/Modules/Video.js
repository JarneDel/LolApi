export function loadAllVideo(champion) {
    const elements = document.querySelectorAll('.js-ability-video');
    for (const element of elements) {
        element.dataset.video_error = false;
        document.querySelector(".js-video-error").classList.add("u-hidden");
        document.querySelector('.js-video-error-text').classList.add('u-hidden');
        element.pause();
        if (element.dataset.name === "P") {
            // remove hidden class
            element.classList.remove("u-hidden");
        } else {
            element.classList.add("u-hidden");
        }
        let id = champion.key;
        const length = id.toString().length;
        // add 0 to id so that it is 4 digits long
        for (let i = 0; i < 4 - length; i++) {
            id = "0" + id;
        }
        element.children[0].onerror = function () {
            console.log("error");
        };
        element.children[1].onerror = function () {
            console.log("error");
            document.querySelector(".js-video-error").classList.remove("u-hidden");
            document.querySelector('.js-video-error-text').classList.remove('u-hidden');
            element.dataset.video_error = true;
            element.classList.add("u-hidden");
        };

        const webm = `https://d28xe8vt774jo5.cloudfront.net/champion-abilities/${id}/ability_${id}_${element.dataset.name}1.webm`;
        const mp4 = `https://d28xe8vt774jo5.cloudfront.net/champion-abilities/${id}/ability_${id}_${element.dataset.name}1.mp4`;
        element.children[0].src = webm;
        element.children[1].src = mp4;
        element.load();
        if (element.dataset.name === "P") {
            element.play();
        }
    }
}

export function resetVideo() {
    document.querySelector('.js-video-error-text').classList.add('u-hidden');
    document.querySelector('.js-video-error').classList.add('u-hidden');
}

export function toggleVideo(type) {
    for (let video of document.querySelectorAll('.js-ability-video')) {
        if (type === video.dataset.name) {
            if (video.dataset.video_error === "true") {
                console.log("video error");
                document.querySelector(".js-video-error").classList.remove("u-hidden");
                document.querySelector('.js-video-error-text').classList.remove('u-hidden');
                continue;
            }else{
                document.querySelector(".js-video-error").classList.add("u-hidden");
                document.querySelector('.js-video-error-text').classList.add('u-hidden');
            }
            video.classList.remove("u-hidden");
            video.currentTime = 0;
            video.play();
        } else {
            video.classList.add("u-hidden");
            // stop the video, so that it starts from the beginning when it is played again
            video.pause();
            video.currentTime = 0;
        }
    }
}
