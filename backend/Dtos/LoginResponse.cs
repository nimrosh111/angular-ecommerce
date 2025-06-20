namespace Authentication.Dtos
{
    public class LoginResponse
    {
        public string JwtToken { get; set; }
        public Guid CustomerId { get; set; }
        public List<string> Roles { get; set; }
    }
}
