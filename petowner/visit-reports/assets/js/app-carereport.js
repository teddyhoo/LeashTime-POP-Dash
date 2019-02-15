    function getVisitReport(nugget) {
        let url = 'https://leashtime.com/visit-report-data.php?nugget='+nugget;
        fetch(url)
        .then((response)=> {
            return response.json();
        })
        .then((visitReportJSON) => {
            console.log(visitReportJSON);                
            var myVisitReport = VR$(visitReportJSON);
            var pageItems = document.querySelectorAll(".vrd"); 
            for ( var i = 0; i < pageItems.length; i++ ) {
                var vrAttr = pageItems[i].dataset.vrdata;
                var vrData = myVisitReport[vrAttr];    
                pageItems[i].innerHTML = vrData;
            }
            myVisitReport.setPhoto();
            myVisitReport.setMap();
        })
    }

    
    

