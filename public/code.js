(function () {
    let receiverID;
    const socket = io();

    function generateID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
            .replace(/[xy]/g, function (c) {
                const r = Math.random() * 16 | 0,
                    v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
    }

    document.querySelector('#sender-start-con-btn').addEventListener('click',()=>{
        let joinID = generateID();
        document.querySelector('#join-id').innerHTML = `
            <b>Room ID</b>
            <span>${joinID}</span>
        `;

        socket.emit('sender-join',{
            uid: joinID
        });
    });

    socket.on("init",(uid)=>{
        receiverID = uid;
        document.querySelector('.join-screen').classList.remove('active');
        document.querySelector('.fs-screen').classList.add('active');
    });

    document.querySelector('#file-input').addEventListener('change',(e)=>{
        let file = e.target.files[0];
        if(!file){
            return;
        }

        let reader = new FileReader();

        reader.onload = (e)=>{
            let buffer = new Uint8Array(reader.result);
            let el = document.createElement('div');
            el.classList.add("item");
            el.innerHTML = `
                <div class="progress">0%</div>
                <div class="filename">${file.name}</div>
            `;

            document.querySelector('.files-list').appendChild(el);

            shareFile({
                filename: file.name,
                total_buffer_size: buffer.length,
                buffer_size: 1024
            }, buffer,el.querySelector('.progress'));
        }
        reader.readAsArrayBuffer(file);
    });

    function shareFile(metadata, buffer, progress_node){
        socket.emit('file-meta',{
            uid: receiverID,
            metadata: metadata
        });

        socket.on('fs-share',()=>{
            let chunk = buffer.slice(0,metadata.buffer_size);
            buffer = buffer.slice(metadata.buffer_size,buffer.length);
            progress_node.innerHTML = Math.trunc((metadata.total_buffer_size - buffer.length)/ metadata.total_buffer_size *100) + "%";
            if(chunk.length != 0){
                socket.emit("file-raw",{
                    uid: receiverID,
                    buffer: chunk
                });
            }
        })
    }
})();