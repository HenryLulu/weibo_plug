var today = new Date();
today.setHours(0);
today.setMinutes(0);
today.setSeconds(0);
today.setMilliseconds(0);
var oneday = 1000 * 60 * 60 * 24;
var yesterday = new Date(today - oneday);

spider_data = []
spider_end = false
spider_key = $.lulu_config().spider_key
$(".pf_opt").append("<button id='spider_btn'>start</button>");
$("#spider_btn").click(function(){
    loader();
});
function loader(){
    var interval = setInterval(function(){
        var next = $(".page.next")
        next.attr("id","next")
        if(next.length>0){
            clearInterval(interval);    //到底,清除loader循环
            var list = $(".WB_feed .WB_cardwrap .WB_detail")
            list.each(function(){
                var time = $(this).find(".WB_from>[date]").attr("date");
                var title = $(this).find(".WB_from>[date]").attr("title");
                var content = $(this).find(".WB_text").text().replace(/\s|\r|\n/g,"");
                if(time>1480000000000&&time<yesterday){
                    spider_end = true
                }else{
                    if(time>1480000000000&&time<today){
                        spider_data.push({
                            title:title,
                            time:time,
                            content:content
                        })
                    }
                }
            })
            document.getElementById("next").click();
            if(!spider_end){
                loader();
            }else{
                calculate();
            }
        }
        var h = $(document).height()-$(window).height();
        $(document).scrollTop(h);
    },1000)
}

function calculate(){
    var reg = /.*【.*￥(\d+\.\d+).*】([^，]+)，{0,1}.*/
    var times = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    var prices = [0,0,0,0,0,0,0,0]//0-5,5-10,10-15,15-20,20-30,30-50,50-100,100+
    var detail = [0,0,0,0,0,0,0]
    var unknow = ""
    var current_unknow;
    for(var i = 0 ; i < spider_data.length ; i++){
        current_unknow = true;
        var current_data = spider_data[i];

        var reg_res = current_data.content.match(reg);
        if(reg_res){

            if(reg_res[2].search("【")>-1){continue}
            //console.log(reg_res[1]+reg_res[2])
            var price = parseFloat(reg_res[1]);
            if(price<5){
                prices[0] ++
            }else if(price<10){
                prices[1] ++
            }else if(price<15){
                prices[2] ++
            }else if(price<20){
                prices[3] ++
            }else if(price<30){
                prices[4] ++
            }else if(price<50){
                prices[5] ++
            }else if(price<100){
                prices[6] ++
            }else{
                prices[7] ++
            }

            for(var k=0;k<spider_key.length;k++){
                var c_key = spider_key[k];
                for(var n=0;n<c_key.length;n++){
                    if(reg_res[2].search(c_key[n])>0){
                        console.log(reg_res[2])
                        current_unknow=false;
                        detail[k] ++;
                        break
                    }
                }
                if(!current_unknow){break}
            }
            if(current_unknow){
                unknow += "<p>"+reg_res[2]+"</p>"
            }
        }else{
            continue
        }

        var hour = current_data.title.split(/\s|:/g)[1]
        if(hour&&hour>0&&hour<24){
            if(hour<8){hour=8}
            times[hour-8] += 1;
        }else{
            continue
        }
    }

    console.log(times)
    console.log(prices)
    spider_show(times,prices,detail,unknow)
}

function spider_show(t,p,d,u){
    $("html").append("<div id='spider_show' style='position: fixed;background: white;top: 50px;left: 0;right: 0;width: 1100px;margin: auto;z-index: 1000;padding: 50px;'>" +
        "<div id='spider_time' style='width: 400px;height: 400px;display: inline-block'></div>" +
        "<div id='spider_price' style='width: 250px;height: 400px;display: inline-block'></div>" +
        "<div id='spider_catelog' style='width: 350px;height: 400px;display: inline-block'></div>" +
        "<div id='spider_unknow' style='width: 1000px;height: 200px;overflow:scroll;'></div>"+
        "</div>")
    $("#spider_show").append("<button id='spider_close' style='position: absolute;top: 5px;right: 5px'>关闭</button>")
    $("#spider_close").click(function(){
        $("#spider_show").remove()
    })

    var tc = echarts.init(document.getElementById('spider_time'));
    t_option = {
        title:{
            text:"时间分布"
        },
        color: ['#3398DB'],
        tooltip : {
            trigger: 'axis',
            axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis : [
            {
                type : 'category',
                data : ['9点前','9点','10点','11点','12点','1点','2点','3点','4点','5点','6点','7点','8点','9点','10点','11点'],
                axisTick: {
                    alignWithLabel: true
                }
            }
        ],
        yAxis : [
            {
                type : 'value'
            }
        ],
        series : [
            {
                name:'宝贝数量',
                type:'bar',
                barWidth: '60%',
                data:t
            }
        ]
    };
    tc.setOption(t_option)

    var pc = echarts.init(document.getElementById('spider_price'));
    p_option = {
        title:{
            text:"价格分布"
        },
        color: ['#3398DB'],
        tooltip : {
            trigger: 'axis',
            axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis : [
            {
                type : 'category',
                data : ['0-5','5-10','10-15','15-20','20-30','30-50','50-100','100+'],
                axisTick: {
                    alignWithLabel: true
                }
            }
        ],
        yAxis : [
            {
                type : 'value'
            }
        ],
        series : [
            {
                name:'宝贝数量',
                type:'bar',
                barWidth: '60%',
                data:p
            }
        ]
    };
    pc.setOption(p_option)

    var dc = echarts.init(document.getElementById('spider_catelog'));
    d_option = {
        title:{
            text:"品类分布"
        },
        color: ['#3398DB'],
        tooltip : {
            trigger: 'axis',
            axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis : [
            {
                type : 'category',
                data : [
                    "食品",
                      "鞋包服饰",
                      "数码",
                      "家居",
                    "护肤美妆",
                      "家电厨房",
                      "办公文具"
                ],
                axisTick: {
                    alignWithLabel: true
                }
            }
        ],
        yAxis : [
            {
                type : 'value'
            }
        ],
        series : [
            {
                name:'宝贝数量',
                type:'bar',
                barWidth: '60%',
                data:d
            }
        ]
    };
    dc.setOption(d_option)
    $("#spider_unknow").html(u)
}
