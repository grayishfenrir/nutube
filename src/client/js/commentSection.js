const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");

const deleteBtns = document.querySelectorAll(".video__comment-btn");

const addCommentToHTML = (text, id) => {
    const videoComments = document.querySelector(".video__comments ul");
    const newComment = document.createElement("li");
    newComment.dataset.id = id;
    newComment.className = "video__comment";
    const span = document.createElement("span");
    const icon = document.createElement("i");
    icon.className = "fas fa-comment";
    const deleteBtn = document.createElement("button");
    deleteBtn.class = "video__comment-btn";
    deleteBtn.addEventListener("clikc")
    const deleteIcon = document.createElement("i");
    deleteIcon.className = "fas fa-eraser";

    newComment.appendChild(icon);
    newComment.appendChild(span);
    span.innerText = ` ${text} `;
    span.appendChild(deleteBtn);
    deleteBtn.appendChild(deleteIcon);
    videoComments.prepend(newComment);
};

const deleteCommentFromHTML = (id) => {
    const targetBtn = document.querySelector(`[id='${id}']`);
    const targetCommentDeleteIcon = targetBtn.querySelector("i");
    const targetLi = targetBtn.parentElement;
    const targetCommentIcon = targetLi.querySelector("i");
    const targetComment = targetLi.querySelector("span");

    targetBtn.remove();
    targetCommentDeleteIcon.remove();
    targetLi.remove();
    targetCommentIcon.remove();
    targetComment.remove();
};

const deleteComment = async (e) => {
    let id;
    if (e.target.childElementCount === 0) {
        id = e.target.parentElement.id;
    } else {
        id = e.target.id;
    }

    const res = await fetch(`/api/comments/${id}`, {
        method: "DELETE",
    });

    if (res.status === 200) {
        deleteCommentFromHTML(id);
    }

};

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const textarea = form.querySelector("textarea");
        const text = textarea.value;
        const { id } = videoContainer.dataset;
        if (text === "") {
            return;
        }

        const res = await fetch(`/api/videos/${id}/comments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                text,
            }),
        });
        // console.log(res);

        if (res.status === 201) {
            const { newCommentId } = await res.json();
            addCommentToHTML(text, newCommentId);
            textarea.value = "";
        }

        // window.location.reload();
    });
}

if (deleteBtns || deleteBtns.length !== 0) {
    deleteBtns.forEach(function (deleteBtn) {
        deleteBtn.addEventListener("click", deleteComment);
    });
}
