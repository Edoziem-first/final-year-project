loadReports();

async function loadReports() {
    try {

        const response = await fetch(
            "http://127.0.0.1:5050/api/reports",
            {
                headers: getAuthHeaders()
            }
        );

        const reportData = await response.json();


        // SUMMARY CARDS

        document.getElementById(
            "inventoryCount"
        ).innerText =
        reportData.inventory;


        document.getElementById(
            "salesRevenue"
        ).innerText =
        "₦" +
        reportData.sales;


        document.getElementById(
            "supplierCount"
        ).innerText =
        reportData.suppliers;


        document.getElementById(
            "staffCount"
        ).innerText =
        reportData.staff;



        // LOW STOCK COUNT

        const inventoryResponse =
        await fetch(
            "http://127.0.0.1:5050/api/inventory",
            {
                headers:
                getAuthHeaders()
            }
        );

        const inventoryData =
        await inventoryResponse.json();


        const lowStock =
        inventoryData.filter(

            item =>

            item.quantity <=
            item.minimum_level

        );


        if(

            document.getElementById(
                "lowStockCount"
            )

        ){

            document.getElementById(
                "lowStockCount"
            ).innerText =
            lowStock.length;

        }

    }

    catch(error){

        console.error(
            error
        );

    }

}