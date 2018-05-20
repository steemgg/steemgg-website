<template>
  <div class="common-footer" >
      <ul class="social-icons1 agileinfo">
        <li><a href="https://www.facebook.com/Steemgg-241891609891471" target="_blank"><i class="fa fa-facebook"></i></a></li>
        <li><a href="https://twitter.com/steemgg" target="_blank"><i class="fa fa-twitter"></i></a></li>
        <!--<li><a href="#"><i class="fa fa-linkedin"></i></a></li>-->
        <li><a href="https://www.youtube.com/channel/UCzj0PmrqH_jnZ9AOKwRToJw" target="_blank"><i class="fa fa-youtube"></i></a></li>
        <!--<li><a href="#"><i class="fa fa-google-plus"></i></a></li>-->
      </ul>
    <div class="policy-link">
      <router-link :to="{name: 'cookiePolicy'}" tag="a">Cookie Policy</router-link> |
      <router-link :to="{name: 'termsOfService'}" tag="a">Terms of Service</router-link>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'CommonFooter',
    data () {
      return {
      }
    },
    mounted () {
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  .common-footer {
    background: #0c0d0d;
    height: 60px;
    width: calc(100% - 40px);
    position: fixed;
    bottom: 0px;
    left: 20px;
    z-index: 10001;
    display: flex;

    .policy-link {
      color: white;
      display: flex;
      align-items: center;
      font-size: 14px;
      a {
        margin: 0 10px;
        color: white;

      }
      a:hover {
        color: red
      }
    }
  }

  .common-footer ul.social-icons1 {
    list-style: none;
    margin: 1.5em auto;
    text-align: center;
  }
  .common-footer ul.social-icons1 li {
    display:inline-block;
    margin-right: 6px;
  }
  .common-footer ul.social-icons1 li a {
    text-decoration:none;
    font-size:16px;
    color:#000;
  }
  .common-footer ul.social-icons1 li a i.fa {
    font-size: 18px;
    line-height: 41px;
    width:42px;
    height:42px;
    border: 1px solid #999;
    text-align: center;
    background-color: transparent;
    transition: all 0.5s ease-in-out;
    -webkit-transition: all 0.5s ease-in-out;
    -moz-transition: all 0.5s ease-in-out;
    -o-transition: all 0.5s ease-in-out;
    -ms-transition: all 0.5s ease-in-out;
    color: #fff;
  }
  .common-footer ul.social-icons1 li a i.fa:hover {
    background-color:#fe423f;
    border: 1px solid #fe423f;
    color:#fff;
  }
  .common-footer ul.social-icons1 li a:hover {
    color:#fff;
  }

</style>
