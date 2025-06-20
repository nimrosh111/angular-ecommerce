using Authentication.Entities;
using Authentication.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;


namespace Authentication.Db
{
    public class AppDbContext : IdentityDbContext<User>
    {
        public AppDbContext(DbContextOptions options) : base(options)
        {
        }
        public DbSet<Customer> customers { get; set; }


        public DbSet<Product> Products { get; set; }  // 👈 this connects your model to the DB

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            // For Product (if you're using an external ID like from fakestoreapi)
            //modelBuilder.Entity<Product>()
            //    .Property(p => p.Id)
            //    .ValueGeneratedNever();  // ✔️ because you're inserting external IDs

            modelBuilder.Entity<Customer>()
       .ToTable("Customers");  // match your DB table name exactly

            // For CartItem (let DB auto-generate Id)
            modelBuilder.Entity<CartItem>()
                .Property(c => c.Id)
                .ValueGeneratedOnAdd();  // ✔️ for auto-incremented primary key

            modelBuilder.Entity<OrderSummaryModel>()
                .HasMany(o => o.Products)
                .WithOne()
                .HasForeignKey("OrderSummaryId");

            modelBuilder.Entity<OrderSummaryModel>()
                .HasMany(o => o.Products)
                .WithOne(p => p.OrderSummary)
                .HasForeignKey(p => p.OrderSummaryId);

        }


        public DbSet<CartItem> CartItems { get; set; }

        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }

        public DbSet<OrderSummaryModel> OrderSummaries { get; set; }

        public DbSet<OrderSummaryItem> OrderSummaryItems { get; set; }

        public DbSet<WishListItem> WishlistItems { get; set; }




    }
}
