angular.module('displayDateService',[])
    .service("displayDate", ['$http',function($http){  
        var obj = {};
 
    /*getDisplayName() function for change of timezone or modification of time
     
         * modification_type is 'timezone_change' in case timezone needs to be changed
         * modification_type is 'time_update' in case time needs to be updated
         * modification_type is 'timezone_time_update' in case both needs to be updated
         * modification_type is 'timezone_time_update' in case both needs to be updated
         * timezone_type is 'gmt_to_local' in case timezone needs to be changed from gmt to local
         * timezone_type is 'local_to_gmt' in case timezone needs to be changed from local to gmt
         * value_to_add is time to be added in date and input format is 'hh:mm:ss'
     
         */

    obj.getDisplayName = function(scope,latest_time, latest_date, modification_type, timezone_type,value_to_add)
    {
      
         ////console.log("latest_time....."+latest_time+"....length....."+latest_time.length);
        ////console.log("latest_date......."+latest_date+"....length......"+latest_date.length);
      
        var value_to_add_arr= value_to_add.split(":"); 
                
        var latest_time_hours = parseInt(latest_time.substring(0, 2));
        var latest_time_minutes = parseInt(latest_time.substring(2, 4));
        var latest_day = parseInt(latest_date.substring(0, 2));
        var latest_month = latest_date.substring(2, 5);
        var latest_year = parseInt(latest_date.substring(5, 9));
       
        var m_names = new Array("JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC");
        var latest_month_index = m_names.indexOf(latest_month);
        var newdate = new Date("2005-01-20T05:30:00Z");
        //alert("newdate......."+newdate);
        newdate.setDate(latest_day);
        newdate.setYear(latest_year);
        newdate.setMonth(latest_month_index);
        newdate.setHours(latest_time_hours);
        newdate.setMinutes(latest_time_minutes);
        newdate.setSeconds("00");
       
        if (modification_type == "timezone_change")
        {
            if(timezone_type=="gmt_to_local")
            {
                newdate.setMinutes(newdate.getMinutes() - newdate.getTimezoneOffset());
            }
            else  if(timezone_type=="local_to_gmt")
            {
                newdate.setMinutes(newdate.getMinutes() + newdate.getTimezoneOffset());           
            }
        }
        else if (modification_type == "time_update")
        {
            newdate.setHours(newdate.getHours()+Number(value_to_add_arr[0]));
            newdate.setMinutes(newdate.getMinutes()+Number(value_to_add_arr[1]));
            newdate.setSeconds(newdate.getSeconds()+Number(value_to_add_arr[2]));
        }
        else if (modification_type == "timezone_time_update")
        {
           
            newdate.setHours(newdate.getHours()+Number(value_to_add_arr[0]));
            newdate.setMinutes(newdate.getMinutes()+Number(value_to_add_arr[1]));
            newdate.setSeconds(newdate.getSeconds()+Number(00));

            if(timezone_type=="gmt_to_local")
            {
              
                newdate.setMinutes(newdate.getMinutes()- newdate.getTimezoneOffset());
            }
             
        }

        var latest_time_hours_mod = newdate.getHours();
        var latest_time_minutes_mod = newdate.getMinutes();
        var latest_day_mod = newdate.getDate();
        var latest_month_mod = m_names[newdate.getMonth()];
        var latest_year_mod = newdate.getFullYear();

        if (newdate.getHours() < 10)
        {
            latest_time_hours_mod = "0" + newdate.getHours();
        }
        if (newdate.getMinutes() < 10)
        {
            latest_time_minutes_mod = "0" + newdate.getMinutes();
        }
        if (newdate.getDate() < 10)
        {
            latest_day_mod = "0" + newdate.getDate();
        }

        var latest_time_mod = latest_time_hours_mod + "" + latest_time_minutes_mod;
        var latest_date_mod = latest_day_mod + "" + latest_month_mod + "" + latest_year_mod;
        var latest_date_time_mod = latest_date_mod + " " + latest_time_mod;
        // //console.log("latest_date_time_mod.........."+latest_date_time_mod);
        return latest_date_time_mod;
    }





      
      return obj;
    }]);

 

