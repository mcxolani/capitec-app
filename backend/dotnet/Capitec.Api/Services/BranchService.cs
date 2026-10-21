using Capitec.Api.Models;

namespace Capitec.Api.Services;

public class BranchService
{
    private const string Hours = "Mon–Fri 08:30–16:30 · Sat 08:30–12:30";

    private static readonly List<Branch> Branches =
    [
        Branch("sandton-city", "Sandton City", "Sandton City, Rivonia Rd, Sandhurst", -26.1076, 28.0567, "011 555 0101"),
        Branch("rosebank", "Rosebank", "The Zone, Oxford Rd, Rosebank", -26.1457, 28.0436, "011 555 0102"),
        Branch("fourways", "Fourways", "Fourways Mall, Witkoppen Rd, Fourways", -26.023, 28.007, "011 555 0103"),
        Branch("randburg", "Randburg", "Randburg Waterfront, Republic Rd, Randburg", -26.094, 28, "011 555 0104"),
        Branch("braamfontein", "Braamfontein", "Jorissen St, Braamfontein", -26.1925, 28.034, "011 555 0105"),
        Branch("eastgate", "Eastgate", "Eastgate Shopping Centre, Bedfordview", -26.183, 28.155, "011 555 0106"),
        Branch("waterfall", "Waterfall", "Mall of Africa, Lone Creek Cres, Waterfall City", -26.0158, 28.1099, "011 555 0107"),
        Branch("centurion", "Centurion", "Centurion Mall, Heuwel Rd, Centurion", -25.8603, 28.1894, "012 555 0108"),
        Branch("menlyn", "Menlyn", "Menlyn Park, Atterbury Rd, Pretoria", -25.784, 28.2764, "012 555 0109"),
        Branch("pretoria-cbd", "Pretoria CBD", "Church Square, Pretoria", -25.7461, 28.1881, "012 555 0110"),
        Branch("maponya", "Maponya Mall", "Maponya Mall, Klipspruit Valley Rd, Soweto", -26.257, 27.909, "011 555 0111"),
        Branch("boksburg", "Boksburg", "Boksburg Mall, Trichardts Rd, Boksburg", -26.212, 28.251, "011 555 0112"),
        Branch("va-waterfront", "V&A Waterfront", "Victoria Wharf, Breakwater Blvd, V&A Waterfront", -33.9036, 18.4207, "021 555 0201"),
        Branch("cape-town-cbd", "Cape Town CBD", "St George's Mall, Cape Town City Centre", -33.9221, 18.4196, "021 555 0202"),
        Branch("sea-point", "Sea Point", "Main Rd, Sea Point", -33.915, 18.387, "021 555 0203"),
        Branch("canal-walk", "Canal Walk", "Canal Walk, Century Blvd, Century City", -33.893, 18.511, "021 555 0204"),
        Branch("n1-city", "N1 City", "N1 City Mall, Louwtjie Rothman St, Goodwood", -33.8935, 18.56, "021 555 0205"),
        Branch("claremont", "Claremont", "Cavendish Square, Dreyer St, Claremont", -33.9806, 18.465, "021 555 0206"),
        Branch("tyger-valley", "Tyger Valley", "Tyger Valley Centre, Willie van Schoor Ave, Bellville", -33.8728, 18.6328, "021 555 0207"),
        Branch("blue-route", "Blue Route", "Blue Route Mall, Tokai Rd, Tokai", -34.056, 18.463, "021 555 0208"),
        Branch("mitchells-plain", "Mitchells Plain", "Town Centre, Merrydale Ave, Mitchells Plain", -34.048, 18.618, "021 555 0209"),
        Branch("khayelitsha", "Khayelitsha", "Khayelitsha Mall, Walter Sisulu Rd, Khayelitsha", -34.0398, 18.6764, "021 555 0210"),
        Branch("somerset-west", "Somerset West", "Somerset Mall, Bizweni Ave, Somerset West", -34.0795, 18.8235, "021 555 0211"),
        Branch("stellenbosch", "Stellenbosch", "Eikestad Mall, Andringa St, Stellenbosch", -33.937, 18.861, "021 555 0212"),
        Branch("durban-cbd", "Durban CBD", "Dr Pixley KaSeme St, Durban Central", -29.858, 31.023, "031 555 0301"),
        Branch("musgrave", "Musgrave", "Musgrave Centre, Musgrave Rd, Berea", -29.844, 31.004, "031 555 0302"),
        Branch("morningside", "Morningside", "Florida Rd, Morningside", -29.83, 31.017, "031 555 0303"),
        Branch("umhlanga", "Umhlanga", "Gateway Theatre of Shopping, Palm Blvd, Umhlanga Ridge", -29.7276, 31.0663, "031 555 0304"),
        Branch("pavilion", "The Pavilion", "The Pavilion, Jack Martens Dr, Westville", -29.8486, 30.933, "031 555 0305"),
        Branch("pinetown", "Pinetown", "Pinecrest Centre, Old Main Rd, Pinetown", -29.817, 30.86, "031 555 0306"),
        Branch("bridge-city", "Bridge City", "Bridge City Mall, Bridge City Ave, KwaMashu", -29.738, 30.98, "031 555 0307"),
        Branch("chatsworth", "Chatsworth", "Chatsworth Centre, Joyhurst Rd, Chatsworth", -29.91, 30.885, "031 555 0308"),
        Branch("bluff", "Bluff", "Bluff Towers, Bluff Rd, Bluff", -29.929, 31.011, "031 555 0309"),
        Branch("amanzimtoti", "Amanzimtoti", "Galleria Mall, Moss Kolnik Dr, Amanzimtoti", -30.05, 30.88, "031 555 0310"),
        Branch("ballito", "Ballito", "Ballito Junction, Leonora Dr, Ballito", -29.524, 31.214, "031 555 0311")
    ];

    public List<Branch> GetBranches() => Branches;

    private static Branch Branch(string id, string name, string address, double lat, double lng, string phone) =>
        new(id, name, address, new Position(lat, lng), phone, Hours);
}
