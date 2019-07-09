﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend_api.Models
{
    public class ProgramObjectModel
    {
        public ProgramObjectModel() { }
        public int NumberOfPrograms { get; set; }
        public string ProgramName { get; set; }
        public decimal ProgramCostPerYear { get; set; }
        public decimal ProgramFlatCost { get; set; }
        public string ProgramLicenseKey { get; set; }
        public bool IsLicense { get; set; }
        public string ProgramDescription { get; set; }
        public string ProgramPurchaseLink { get; set; }
        public DateTime DateBought { get; set; }
        public DateTime? RenewalDate { get; set; }
        public int? MonthsPerRenewal { get; set; }
    }
}