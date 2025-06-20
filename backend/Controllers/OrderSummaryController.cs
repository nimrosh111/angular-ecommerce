using Authentication.Db;
using Authentication.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;

namespace Authentication.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderSummaryController : ControllerBase
    {
        private readonly AppDbContext _db;

        public OrderSummaryController(AppDbContext db)
        {
            _db = db;
        }

        [HttpPost("save-summary")]
        public async Task<IActionResult> SaveOrderSummary([FromBody] OrderSummaryModel orderSummary)
        {
            if (orderSummary == null || orderSummary.Products == null || !orderSummary.Products.Any())
                return BadRequest("Invalid order summary.");

            await _db.OrderSummaries.AddAsync(orderSummary);
            await _db.SaveChangesAsync();

            return Ok("Order summary saved successfully!");
        }
    }
    }


