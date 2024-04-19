<template>
  <div>
    <el-select v-model="selectedCamera" placeholder="选择摄像头">
      <el-option v-for="device in devices" :key="device.deviceId" :label="device.label" :value="device.deviceId"/>
    </el-select>
    <el-button type="primary" @click="startCamera">开启摄像头</el-button>
    <el-button type="primary" @click="fullScreen">全屏</el-button>
    <div ref="videoContainer">
      <video id="video_CAM" ref="video" autoplay playsinline style=" object-fit: cover;"></video>
      <span ref="tips"></span>
      <br>
      <span ref="end"></span>
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client'
import { getOpenCVApi } from '@/api/attendance'

export default {
  data () {
    return {
      devices: [],
      selectedCamera: null
    }
  },
  mounted () {
    this.getDevices()
  },
  methods: {
    async getDevices () {
      const devices = await navigator.mediaDevices.enumerateDevices()
      this.devices = devices.filter(device => device.kind === 'videoinput')
      if (this.devices.length > 0) {
        this.selectedCamera = this.devices[0].deviceId
      }
    },
    async startCamera () {
      const constraints = {
        audio: false,
        video: {
          deviceId: { exact: this.selectedCamera }
        }
      }
      try {
        // eslint-disable-next-line no-unused-vars
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        this.$refs.video.srcObject = stream
        await this.startWS(constraints)
      } catch (error) {
        console.error('Error accessing camera:', error)
      }
    },
    async startStreaming (stream) {
      const socket = io(getOpenCVApi())
      socket.emit('video-stream', stream)
      // 监听服务器返回的帧数据
      socket.on('frame', (data) => {
        const jsonO = JSON.parse(data)
        if (jsonO.type === 'end') {
          this.$refs.end.innerText = '识别结束'
        } else if (jsonO.type === 'tips') {
          this.$refs.tips.innerText = jsonO.data
        } else {
          // 更新帧数据
          this.$refs.video.src = 'data:image/jpeg;base64,' + jsonO.data
        }
      })
    },
    async startWS (constraints) {
      let status = 'wait'
      let sendSteamId
      console.log('ws://' + location.host + '/checkin')
      const socket = new WebSocket(getOpenCVApi() + '?session=' + new Date().getTime().toString())
      // 连接打开时发送一条消息
      socket.addEventListener('open', function (event) {
        socket.send('Get Server')
        socket.send('waiting server')
      })

      // 接收到消息时在控制台打印
      socket.addEventListener('message', function (event) {
        console.log('Message from server: ', event.data)
        if (status === 'wait') { // 等待分配opencv服务器
          if (event.data === 'waiting server') { // 稍等再次发送
            // 休眠3秒
            setTimeout(() => {
              socket.send('waiting server')
            }, 3000)
          }
          if (event.data === 'server ready') { // 服务器准备就绪
            socket.send('start streaming')
            status = 'streaming'
            // 开始发送帧数据
            // 每0.1秒发送一次
            sendSteamId = setInterval(() => {
              if (status === 'streaming') {
                sendVideoFrame(document.getElementById('video_CAM'))
              }
            }, 100)

            // eslint-disable-next-line no-inner-declarations,no-unused-vars
            function sendVideoFrame (video) {
              const canvas = document.createElement('canvas')
              canvas.width = video.clientWidth
              canvas.height = video.clientHeight
              const ctx = canvas.getContext('2d')
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
              const frame = canvas.toDataURL('image/jpeg')
              socket.binaryType = 'arraybuffer'
              // 分包发送
              const frameData = frame.split(';base64,')[1]
              const frameLength = frameData.length
              const frameChunk = 1024
              const frameChunks = Math.ceil(frameLength / frameChunk)
              for (let i = 0; i < frameChunks; i++) {
                const start = i * frameChunk
                const end = (i + 1) * frameChunk
                const frameChunkData = frameData.substring(start, end)
                socket.send(frameChunkData + ',' + frameLength)
              }
            }
          }
        } else if (status === 'streaming') { // 正在发送帧数据
          if (event.data === 'stop streaming') {
            socket.send('stop streaming')
            status = 'wait'
          }
          if (event.data === 'waiting server') {
            console.log('waiting server')
            status = 'wait'
            socket.send('waiting server')
          }
          const jsonO = JSON.parse(event.data)
          if (jsonO.type === 'tips') {
            this.$refs.tips.innerText = jsonO.data
          }
          if (jsonO.type === 'name') {
            this.$refs.end.innerText = jsonO.data
          }
          // TODO
          // 换成接受视频流并展示到窗口,最好全屏
        }
      })

      // 连接关闭或发生错误时在控制台打印
      socket.addEventListener('close', function (event) {
        console.log('Connection closed')
        console.log(event)
        // 停止定时发送
        clearInterval(sendSteamId)
        // TODO
        // 如果是opencv掉线重新连接
      })
      socket.addEventListener('error', function (event) {
        console.log('Error: ', event)
        // 停止定时发送
        clearInterval(sendSteamId)
      })
    },
    stopCamera () {
      if (this.$refs.video.srcObject) {
        const stream = this.$refs.video.srcObject
        const tracks = stream.getTracks()
        tracks.forEach(track => track.stop())
        this.$refs.video.srcObject = null
      }
    },
    fullScreen () {
      if (this.$refs.video.requestFullscreen) {
        this.$refs.video.requestFullscreen()
      }
    }
  }
}
</script>
