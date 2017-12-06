<template>
  <div class="swiper-container">
    <swiper :options="swiperOption" ref="mySwiper">
      <swiper-slide><img class="slider-image" src="../../assets/images/1.jpeg"/></swiper-slide>
      <swiper-slide><img class="slider-image" src="../../assets/images/2.jpeg"/></swiper-slide>
      <swiper-slide><img class="slider-image" src="../../assets/images/3.jpeg"/></swiper-slide>
      <swiper-slide><img class="slider-image" src="../../assets/images/4.jpeg"/></swiper-slide>
      <swiper-slide><img class="slider-image" src="../../assets/images/3.jpg"/></swiper-slide>
      <div class="swiper-pagination" slot="pagination"></div>
    </swiper>
    <div class="baner-info">
      <h3>
        GET <span>PAID</span> BY PLAYING <span>GAMES</span>
      </h3>
    </div>
  </div>
</template>

<script>
  import { swiper, swiperSlide } from 'vue-awesome-swiper'

  export default {
    components: {
      swiper,
      swiperSlide
    },
    name: 'GameSlider',
    data () {
      return {
        swiperOption: {
          autoplay: 3000,
          pagination: '.swiper-pagination',
          paginationClickable: true
        }
      }
    },
    // you can find current swiper instance object like this, while the notNextTick property value must be true
    // 如果你需要得到当前的swiper对象来做一些事情，你可以像下面这样定义一个方法属性来获取当前的swiper对象，同时notNextTick必须为true
    computed: {
      swiper () {
        return this.$refs.mySwiper.swiper
      }
    },
    mounted () {
      // you can use current swiper instance object to do something(swiper methods)
      // 然后你就可以使用当前上下文内的swiper对象去做你想做的事了
      console.log('this is current swiper instance object', this.swiper)
      this.swiper.slideTo(3, 1000, false)
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  @import '../../../node_modules/swiper/dist/css/swiper.css';
  .slider-image {
    width:100%;
    height:100%;
  }
  .swiper-container {
    height: 500px;
    position: relative;
  }
  .baner-info {
    position: absolute;
    top: 30%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 100;
  }
</style>
