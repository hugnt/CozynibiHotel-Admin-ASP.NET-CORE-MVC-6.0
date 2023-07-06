namespace CozynibiHotel.Admin.Entities
{
	public class RoomCategory
	{
        public RoomCategory()
        {
            Images = new List<string>();
        }
        public int Id { get; set; }
        public string? Name { get; set; }
        public double? Area { get; set; }
        public double? Hight { get; set; }
        public string? BedSize { get; set; }
        public double? RoomRate { get; set; }
        public List<string>? Images { get; set; }
        public string? Description { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? CreatedBy { get; set; }
        public int? UpdatedBy { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
    }
}
