const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");

const addComment = (text, id) => {
    const videoComments = document.querySelector(".video__comments ul");
    const newComment = document.createElement("li");
    newComment.dataset.id = id;
    newComment.className = "video__comment";
    const span = document.createElement("span");
    const icon = document.createElement("i");
    icon.className = "fas fa-comment";
    newComment.appendChild(icon);
    span.innerText = ` ${text}`;
    icon.appendChild(span);
    videoComments.prepend(newComment);
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


        if (res.status === 201) {
            const { newCommentId } = await res.json();
            addComment(text, newCommentId);
            textarea.value = "";
        }

        // window.location.reload();
    });
}