package com.capitec.demo.branch;

import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class BranchService {
    private static final String HOURS = "Mon–Fri 08:30–16:30 · Sat 08:30–12:30";

    private static final List<Branch> BRANCHES = List.of(
            branch("sandton-city", "Sandton City", "Sandton City, Rivonia Rd, Sandhurst",
                    -26.1076, 28.0567, "011 555 0101"),
            branch("rosebank", "Rosebank", "The Zone, Oxford Rd, Rosebank", -26.1457, 28.0436, "011 555 0102"),
            branch("fourways", "Fourways", "Fourways Mall, Witkoppen Rd, Fourways", -26.023, 28.007, "011 555 0103"),
            branch("randburg", "Randburg", "Randburg Waterfront, Republic Rd, Randburg", -26.094, 28, "011 555 0104"),
            branch("braamfontein", "Braamfontein", "Jorissen St, Braamfontein", -26.1925, 28.034, "011 555 0105"),
            branch("eastgate", "Eastgate", "Eastgate Shopping Centre, Bedfordview", -26.183, 28.155, "011 555 0106"),
            branch("waterfall", "Waterfall", "Mall of Africa, Lone Creek Cres, Waterfall City",
                    -26.0158, 28.1099, "011 555 0107"),
            branch("centurion", "Centurion", "Centurion Mall, Heuwel Rd, Centurion", -25.8603, 28.1894, "012 555 0108"),
            branch("menlyn", "Menlyn", "Menlyn Park, Atterbury Rd, Pretoria", -25.784, 28.2764, "012 555 0109"),
            branch("pretoria-cbd", "Pretoria CBD", "Church Square, Pretoria", -25.7461, 28.1881, "012 555 0110"),
            branch("maponya", "Maponya Mall", "Maponya Mall, Klipspruit Valley Rd, Soweto",
                    -26.257, 27.909, "011 555 0111"),
            branch("boksburg", "Boksburg", "Boksburg Mall, Trichardts Rd, Boksburg", -26.212, 28.251, "011 555 0112"),
            branch("va-waterfront", "V&A Waterfront", "Victoria Wharf, Breakwater Blvd, V&A Waterfront",
                    -33.9036, 18.4207, "021 555 0201"),
            branch("cape-town-cbd", "Cape Town CBD", "St George's Mall, Cape Town City Centre",
                    -33.9221, 18.4196, "021 555 0202"),
            branch("sea-point", "Sea Point", "Main Rd, Sea Point", -33.915, 18.387, "021 555 0203"),
            branch("canal-walk", "Canal Walk", "Canal Walk, Century Blvd, Century City",
                    -33.893, 18.511, "021 555 0204"),
            branch("n1-city", "N1 City", "N1 City Mall, Louwtjie Rothman St, Goodwood",
                    -33.8935, 18.56, "021 555 0205"),
            branch("claremont", "Claremont", "Cavendish Square, Dreyer St, Claremont",
                    -33.9806, 18.465, "021 555 0206"),
            branch("tyger-valley", "Tyger Valley", "Tyger Valley Centre, Willie van Schoor Ave, Bellville",
                    -33.8728, 18.6328, "021 555 0207"),
            branch("blue-route", "Blue Route", "Blue Route Mall, Tokai Rd, Tokai", -34.056, 18.463, "021 555 0208"),
            branch("mitchells-plain", "Mitchells Plain", "Town Centre, Merrydale Ave, Mitchells Plain",
                    -34.048, 18.618, "021 555 0209"),
            branch("khayelitsha", "Khayelitsha", "Khayelitsha Mall, Walter Sisulu Rd, Khayelitsha",
                    -34.0398, 18.6764, "021 555 0210"),
            branch("somerset-west", "Somerset West", "Somerset Mall, Bizweni Ave, Somerset West",
                    -34.0795, 18.8235, "021 555 0211"),
            branch("stellenbosch", "Stellenbosch", "Eikestad Mall, Andringa St, Stellenbosch",
                    -33.937, 18.861, "021 555 0212"),
            branch("durban-cbd", "Durban CBD", "Dr Pixley KaSeme St, Durban Central", -29.858, 31.023, "031 555 0301"),
            branch("musgrave", "Musgrave", "Musgrave Centre, Musgrave Rd, Berea", -29.844, 31.004, "031 555 0302"),
            branch("morningside", "Morningside", "Florida Rd, Morningside", -29.83, 31.017, "031 555 0303"),
            branch("umhlanga", "Umhlanga", "Gateway Theatre of Shopping, Palm Blvd, Umhlanga Ridge",
                    -29.7276, 31.0663, "031 555 0304"),
            branch("pavilion", "The Pavilion", "The Pavilion, Jack Martens Dr, Westville",
                    -29.8486, 30.933, "031 555 0305"),
            branch("pinetown", "Pinetown", "Pinecrest Centre, Old Main Rd, Pinetown", -29.817, 30.86, "031 555 0306"),
            branch("bridge-city", "Bridge City", "Bridge City Mall, Bridge City Ave, KwaMashu",
                    -29.738, 30.98, "031 555 0307"),
            branch("chatsworth", "Chatsworth", "Chatsworth Centre, Joyhurst Rd, Chatsworth",
                    -29.91, 30.885, "031 555 0308"),
            branch("bluff", "Bluff", "Bluff Towers, Bluff Rd, Bluff", -29.929, 31.011, "031 555 0309"),
            branch("amanzimtoti", "Amanzimtoti", "Galleria Mall, Moss Kolnik Dr, Amanzimtoti",
                    -30.05, 30.88, "031 555 0310"),
            branch("ballito", "Ballito", "Ballito Junction, Leonora Dr, Ballito", -29.524, 31.214, "031 555 0311")
    );

    public List<Branch> findAll() {
        return BRANCHES;
    }

    private static Branch branch(String id, String name, String address, double lat, double lng, String phone) {
        return new Branch(id, name, address, new Branch.Position(lat, lng), phone, HOURS);
    }
}
