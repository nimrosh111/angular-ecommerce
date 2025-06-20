using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;



    namespace Authentication.Models
    {
        public class OrderSummaryModel
        {
            public Guid Id { get; set; } = Guid.NewGuid();
            public string CustomerId { get; set; }
            public List<OrderSummaryItem> Products { get; set; } = new List<OrderSummaryItem>();
            public decimal GrandTotal { get; set; }
            public string PaymentMethod { get; set; }
        }
    



}
