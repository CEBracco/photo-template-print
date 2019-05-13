$(document).ready(function(){
    $(".file-uploader").dropzone({ 
        url: "/upload",
        paramName: "photo",
        autoProcessQueue: false,
        clickable: ".upload-button",
        previewsContainer: ".file-list",
        previewTemplate: `
            <li class="collection-item avatar">
                <img class="circle" data-dz-thumbnail>
                <span class="title"><span data-dz-name></span></span>
                <p class="details" data-dz-size></p>
                <a href="#!" class="secondary-content" data-dz-remove><i class="material-icons">clear</i></a>
            </li>
        `,
        dragenter: function(){
            $(".file-uploader").addClass("dragging");
        },
        dragleave: function(){
            $(".file-uploader").removeClass("dragging");
        },
        drop: function(){
            $(".file-uploader").removeClass("dragging");
        }
    });

    $('.clear-button').click(function(){
        $(".file-uploader")[0].dropzone.removeAllFiles(true);
    });

    $('.confirm-upload').click(function(){
        $(".file-uploader")[0].dropzone.processQueue();
    });
});

/* <div class="dz-preview dz-file-preview">
    <div class="dz-details">
        <div class="dz-filename"><span data-dz-name></span></div>
        <div class="dz-size" data-dz-size></div>
        <img data-dz-thumbnail />
    </div>
    <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>
    <div class="dz-error-message"><span data-dz-errormessage></span></div>
    <a data-dz-remove>Remove</a>
</div> */