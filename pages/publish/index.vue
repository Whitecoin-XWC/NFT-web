<template>
  <div class="main-container">
    <el-form v-if="!isShowPublishContent" ref="ruleForm" :model="nftFormData" label-width="80px" class="form-container" :rules="rules">
      <div>
        <h2 class="publish-title">{{ $t('发行NFT') }}</h2>
        <h3>{{ $t('上传') }}</h3>
        <p class="publish-des">{{ $t('图像') }}，{{ $t('视频') }}，{{ $t('音频') }}，{{ $t('文本') }}</p>
        <el-form-item>
          <div class="upload-box">
            <div class="upload-text">
              <span>{{ $t('支持类型') }}：JPG.JPEG.PNG. SVG. GIF. MP4. MOV. WEBM. MP3. WAV. OGG. TXT. MD…</span>
              <span> {{ $t('最大') }}: 20 MB</span>
            </div>
            <el-upload class="upload-demo" action="" :accept="accept" :before-upload="beforeUpload" :show-file-list="false">
              <div class="upload-btn"><i></i> {{ $t('选择文件') }}</div>
              <div v-if="!imgUrl.length" class="upload-des">{{ $t('未选择任何文件') }}</div>
              <div v-if="imgUrl.length" class="upload-des">{{ fileName }}</div>
            </el-upload>
          </div>
        </el-form-item>
        <h3 class="info-title">{{ $t('添加信息') }}</h3>
        <div class="add-info">
          <h4>{{ $t('名称') }}</h4>
          <el-form-item prop="title">
            <el-input v-model="nftFormData.title" :placeholder="$t('请输入名称')"></el-input>
          </el-form-item>
          <h4>{{ $t('描述') }}</h4>
          <el-form-item prop="des">
            <el-input
              v-model="nftFormData.des"
              class="des-textarea"
              :placeholder="$t('请输入说明')"
              type="textarea"
              maxlength="1000"
              show-word-limit
            ></el-input>
          </el-form-item>
          <h4 class="cost-title">{{ $t('版权费用') }}</h4>
          <p class="cost-des">{{ $t('您作为创作者将获得的所有未来销售额的百分比') }}（0-20）</p>
          <el-form-item prop="copyrightFee">
            <el-input v-model="nftFormData.copyrightFee" :placeholder="$t('请输入版权费用')"></el-input>
          </el-form-item>
        </div>
      </div>
      <div class="publish-r">
        <h3>{{ $t('预览') }}</h3>
        <div class="img-preview">
          <div v-if="imgUrl.length" class="img-file">
            <span @click="imgUrl = ''"></span>
            <img v-if="fileType === 'image'" :src="imgUrl" alt="" />
            <video v-if="fileType === 'video'" :src="imgUrl" controls></video>
            <audio v-if="fileType === 'audio'" :src="imgUrl" controls></audio>
            <div v-if="fileType === 'file'" class="file-text">{{ fileText }}</div>
          </div>
          <div v-if="!imgUrl.length" class="not-file">
            <img src="../../assets/img/publish/not-info.png" alt="" />
            <p>{{ $t('未选择任何文件') }}</p>
          </div>
        </div>
        <div class="publish-btns">
          <div class="back-btn" @click="$router.go(-1)">{{ $t('返回') }}</div>
          <div class="issue-btn" @click="publishConfirm('ruleForm')">{{ $t('发行') }}</div>
        </div>
      </div>
    </el-form>
    <div v-else-if="isShowPublishContent" class="success-container">
      <img class="success-img" src="../../assets/img/publish/success.png" alt="" />
      <p class="success-text">{{ $t('恭喜您发行成功！') }}</p>
      <div class="shut-down" @click="toPersonal">{{ $t('关闭') }}</div>
    </div>
    <DialogPublish v-if="isShowPublishDialog" :upload-data="uploadData" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  props: {},
  data() {
    const isInteger = (num) => {
      return num % 1 === 0
    }
    const isRealNum = (val) => {
      if (val === '' || val === null) {
        return false
      }
      if (!isNaN(val)) {
        return true
      } else {
        return false
      }
    }
    const verifyCost = (rule, value, callback) => {
      if (!isRealNum(value)) {
        callback(new Error(this.$t('请输入数字')))
      } else if (!isInteger(value)) {
        callback(new Error(this.$t('请输入整数')))
      } else if (value > 20) {
        callback(new Error(this.$t('版权费百分比不能大于20')))
      } else {
        callback()
      }
    }
    return {
      nftFormData: {
        title: '',
        file: {},
        des: '',
        copyrightFee: '',
        userAddress: '',
      },
      imgUrl: '',
      fileName: '',
      uploadData: null,
      accept:
        '.JPG,.jpg,.JPEG,.jpeg,.PNG,.png,.SVG,.svg,.TIFF,.tiff,.GIF,.gif,.MP4,.mp4,.MOV,.mov,.AVI,.avi,.WEBM,.webm,.MP3,.mp3,.WAV,.wav,.OGG,.ogg,.TXT,.txt,.MD,.md',
      rules: {
        title: [
          { required: true, message: this.$t('请输入名称'), trigger: 'blur' },
          { min: 1, max: 20, message: this.$t('长度在20个字符内'), trigger: 'blur' },
        ],
        des: [
          { required: true, message: this.$t('请输入说明'), trigger: 'blur' },
          { min: 1, max: 1000, message: this.$t('长度在1000个字符内'), trigger: 'blur' },
        ],
        copyrightFee: [
          { required: true, message: this.$t('请输入版权费用'), trigger: 'blur' },
          { validator: verifyCost, trigger: 'blur' },
        ],
      },
      fileType: 'image',
      fileText: '',
    }
  },
  computed: {
    ...mapState('publish', ['isShowPublishDialog', 'copyrightFee', 'publishName', 'isShowPublishContent']),
    ...mapState('global', ['address']),
  },
  mounted() {},
  methods: {
    toPersonal() {
      this.$store.commit('publish/set_state', { isShowPublishContent: false })
      this.$router.push(`/personal/${this.address}`)
    },
    publishConfirm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const formData = new FormData()
          this.nftFormData.userAddress = this.address
          for (const item in this.nftFormData) {
            formData.append(item.toString(), this.nftFormData[item])
          }
          this.uploadData = formData
          this.$store.commit('publish/set_state', {
            isShowPublishDialog: true,
            publishName: this.nftFormData.title,
            copyrightFee: this.nftFormData.copyrightFee,
          })
        } else {
          return false
        }
      })
    },
    beforeUpload(file) {
      const byte = 1024 * 1024 * 20
      if (file.size > byte) {
        this.$message.error(this.$t('文件最大不能超过20MB'))
        return false
      }
      this.nftFormData.file = file
      this.fileName = file.name
      this.fileType = this.getFileType(this.fileName)
      if (this.fileType === 'file' && window.FileReader) {
        const reader = new FileReader()
        reader.readAsText(file, 'utf8')
        reader.onload = () => {
          this.fileText = reader.result
        }
      }
      this.imgUrl = URL.createObjectURL(file)
    },
    getFileType(fileName) {
      // 根据后缀判断文件类型
      let fileSuffix = ''
      // 结果
      let result = ''
      try {
        const flieArr = fileName.split('.')
        fileSuffix = flieArr[flieArr.length - 1]
      } catch (err) {
        fileSuffix = ''
      }
      // fileName无后缀返回 false
      if (!fileSuffix) {
        result = false
        return result
      }
      // 匹配图片
      const imglist = ['JPG', 'jpg', 'JPEG', 'jpeg', 'PNG', 'png', 'SVG', 'svg', 'TIFF', 'tiff', 'GIF', 'gif']
      if (imglist.includes(fileSuffix)) {
        result = 'image'
        return result
      }
      // 匹配视频
      const videolist = ['MP4', 'mp4', 'MOV', 'mov', 'AVI', 'avi', 'WEBM', 'webm']
      if (videolist.includes(fileSuffix)) {
        result = 'video'
        return result
      }
      // 匹配音频
      const audioList = ['MP3', 'mp3', 'WAV', 'wav', 'OGG', 'ogg']
      if (audioList.includes(fileSuffix)) {
        result = 'audio'
        return result
      }
      // 匹配文件
      const fileList = ['TXT', 'txt', 'MD', 'md']
      if (fileList.includes(fileSuffix)) {
        result = 'file'
        return result
      }
    },
  },
}
</script>

<style scoped lang="scss">
.main-container {
  position: relative;
  margin: 0 auto;
  width: 1200px;
  .form-container {
    margin-top: 52px;
    display: flex;
  }
  /deep/.el-form-item__content {
    margin-left: 0 !important;
  }
  .upload-box {
    width: 642px;
    height: 173px;
    background: #ffffff;
    border-radius: 4px;
    border: 1px solid #ebebeb;
    margin-bottom: 37px;
    .upload-text {
      display: flex;
      justify-content: space-between;
      padding: 0 20px;
      height: 40px;
      line-height: 40px;
      font-size: 12px;
      font-weight: 400;
      color: #00000080;
      border-bottom: 1px solid #ebebeb;
    }
    // .upload-demo {
    //   display: flex;
    //   margin-top: 46px;
    //   margin-left: 20px;
    //   align-items: center;
    //   .upload-btn {
    //     width: 106px;
    //     height: 32px;
    //     background: #ffffff;
    //     border: 1px solid rgba(0, 0, 0, 0.15);
    //     font-size: 14px;
    //     font-weight: 400;
    //     color: rgba(0, 0, 0, 0.65);
    //     line-height: 32px;
    //     margin-right: 10px;
    //     text-align: center;
    //     position: relative;
    //     input {
    //       width: 100%;
    //       height: 100%;
    //       top: 0;
    //       left: 0;
    //       position: absolute;
    //       opacity: 0;
    //     }
    //     i {
    //       display: inline-block;
    //       width: 14px;
    //       height: 14px;
    //       background: url('../../assets/img/publish/down.png');
    //       background-size: 100% 100%;
    //     }
    //   }
    //   .upload-des {
    //     font-size: 14px;
    //     font-weight: 400;
    //     color: rgba(0, 0, 0, 0.65);
    //     line-height: 22px;
    //   }
    // }
    .upload-demo {
      /deep/.el-upload {
        display: flex;
        margin-top: 46px;
        margin-left: 20px;
        align-items: center;
        .upload-btn {
          width: 106px;
          height: 32px;
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.15);
          font-size: 14px;
          font-weight: 400;
          color: rgba(0, 0, 0, 0.65);
          line-height: 32px;
          margin-right: 10px;
          i {
            display: inline-block;
            width: 14px;
            height: 14px;
            background: url('../../assets/img/publish/down.png');
            background-size: 100% 100%;
          }
        }
        .upload-des {
          font-size: 14px;
          font-weight: 400;
          color: rgba(0, 0, 0, 0.65);
          line-height: 22px;
          width: 490px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }
    }
  }

  .add-info {
    width: 642px;
    height: 404px;
    background: #ffffff;
    border-radius: 4px;
    border: 1px solid #ebebeb;
    padding: 26px 64px 47px 20px;
    margin-bottom: 80px;
    overflow-y: scroll;
  }
  .img-preview {
    width: 300px;
    height: 300px;
    background: #f2f2f2;
    border-radius: 4px;
    border: 1px solid #ebebeb;
    margin-top: 31px;
    text-align: center;
    position: relative;
    .img-file {
      position: absolute;
      left: 50%;
      top: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      transform: translate(-50%, -50%);
      // right: 0;
      // bottom: 0;
      // margin: auto;
      // min-width: 10%;
      // min-height: 10%;
      // max-width: 100%;
      // max-height: 100%;
      width: 100%;
      height: 100%;
      .file-text {
        width: 290px;
        height: 282px;
        overflow: hidden;
        font-size: 17px;
        display: -webkit-box;
        text-overflow: ellipsis;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 12;
      }
      video {
        width: 300px;
        height: 300px;
      }
      img {
        max-width: 100%;
        max-height: 100%;
        min-width: 0;
        min-height: 0;
        // display: inline-block;
      }
      span {
        position: absolute;
        right: -11px;
        top: -11px;
        display: inline-block;
        width: 22px;
        height: 22px;
        background: url('../../assets/img/publish/delete.png');
        background-size: 100% 100%;
        cursor: pointer;
      }
    }
    .not-file {
      margin-top: 99px;
      img {
        width: 82px;
        height: 82px;
        margin-bottom: 13px;
      }
      p {
        font-size: 14px;
        font-weight: 400;
        color: #000000a6;
        line-height: 22px;
      }
    }
  }
  .publish-title {
    font-size: 30px;
    font-weight: 600;
    color: #333333;
    line-height: 42px;
    margin-bottom: 30px;
  }
  h2 {
    font-size: 20px;
    font-weight: 600;
    color: #333333;
    line-height: 28px;
  }
  .publish-des {
    font-size: 14px;
    font-weight: 400;
    color: #999999;
    line-height: 20px;
    margin-bottom: 8px;
  }
  h3 {
    font-size: 20px;
    font-weight: 600;
    color: #333333;
    line-height: 28px;
  }
  h4 {
    font-size: 14px;
    font-weight: 700;
    color: #333333;
    line-height: 22px;
    margin-bottom: 7px;
  }
  .cost-title {
    margin-bottom: 0;
  }
  .cost-des {
    font-size: 14px;
    font-weight: 400;
    color: #999999;
    line-height: 20px;
    margin-bottom: 13px;
  }
  .info-title {
    margin-bottom: 12px;
  }
  .des-textarea {
    margin-bottom: 10px;
    /deep/.el-textarea__inner {
      min-height: 100px !important;
    }
  }
  .publish-r {
    margin-left: 206px;
    padding-top: 72px;
  }
  .publish-btns {
    display: flex;
    margin-top: 104px;
    .back-btn {
      width: 100px;
      height: 50px;
      background: #ffffff;
      border: 1px solid #979797;
      border-radius: 4px;
      text-align: center;
      color: #666666;
      font-size: 18px;
      font-weight: 600;
      line-height: 50px;
      cursor: pointer;
      margin-right: 20px;
      user-select: none;
    }
    .issue-btn {
      width: 180px;
      height: 50px;
      background: #595eff;
      border-radius: 4px;
      text-align: center;
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
      line-height: 50px;
      cursor: pointer;
      user-select: none;
      &:hover {
        opacity: 0.8;
      }
    }
  }
  .success-container {
    width: 100%;
    text-align: center;
    .success-img {
      width: 280px;
      height: 201px;
      margin-top: 220px;
    }
    .success-text {
      font-size: 20px;
      font-weight: 400;
      color: #00000080;
      line-height: 28px;
      margin-top: 21px;
      margin-bottom: 104px;
    }
    .shut-down {
      margin: 0 auto 80px;
      width: 136px;
      height: 50px;
      background: linear-gradient(180deg, #333333 0%, #333333 100%);
      border-radius: 4px;
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
      line-height: 50px;
      user-select: none;
      cursor: pointer;
    }
  }
}
</style>
