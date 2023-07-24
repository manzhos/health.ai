import React, {useState} from "react";

export const ComponentToPrint = React.forwardRef(({inv, onInvoiceUpdate}, ref) => {
  // console.log('invoice2:', inv);
  const [invoice, setInvoice] = useState(inv);

  const handleChangeData = async(e) => {
    // console.warn(e.target.name, ':', e.target.value);
    setInvoice(prevState => ({...prevState, [e.target.name]: e.target.value}));
    onInvoiceUpdate(invoice); 
  }

  return (
    <div ref={ref} style={{ width:"800px", padding:"69px 94px 78px", backgroundColor:"white", margin:"0 auto", textAlign:"left", fontSize:"12px" }}>
      <img src="/static/logo_blank.svg" style={{ width:"270px", margin:"0 auto 58px" }}/>
      <table style={{ width:"100%" }}>
        <tbody>
          <tr>
            <td style={{verticalAlign: "top"}}>
              <p style={{textDecoration:"underline"}}>Kamil Akhundov - Gertraudenstraße 18 - 10178 Berlin</p>
              <br/>
              <table style={{ width:"100%" }}>
                <tbody>
                  <tr><td>{invoice.client_firstname} {invoice.client_lastname}</td></tr>
                  <tr><td><input className='input-blank' id="adress1"       name="client_adress1" onChange={handleChangeData} value={invoice.client_adress1} placeholder="Adress line 1"/></td></tr>
                  <tr><td><input className='input-blank' id="adress2"       name="client_adress2" onChange={handleChangeData} value={invoice.client_adress2} placeholder="Adress line 2"/></td></tr>
                  <tr><td><input className='input-blank' id="adressCountry" name="client_country" onChange={handleChangeData} value={invoice.client_country} placeholder="Country"/></td></tr>
                </tbody>
              </table>
            </td>
            <td style={{verticalAlign: "top", width:"230px" }}>
              <p style={{textDecoration:"underline"}}><strong>So erreichen Sie uns</strong></p>
              <br/>
              <table style={{ width:"100%" }}>
                <tbody>
                  <tr>
                    <td style={{ width:"90px" }}>
                      {'Internet'}
                    </td>
                    <td>
                      {'stunning-you.com'}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      {'Email'}
                    </td>
                    <td>
                      {'info@stunning-you.com'}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      {'Telefon'}
                    </td>
                    <td>
                      {'+49 (0)30 - 92 12 38 93'}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      {'Mobil'}
                    </td>
                    <td>
                      {'+49 172 - 754 54 11'}
                    </td>
                  </tr>
                </tbody>
              </table>
              <p>&nbsp;</p>
              <table style={{ width:"100%" }}>
                <tbody>
                  <tr>
                    <td style={{ width:"90px" }}>
                      {'Steuer-Nr.'}
                    </td>
                    <td>
                      <strong><input className='input-blank' id="steuer" name="steuer" onChange={handleChangeData} value={invoice.steuer} /></strong>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ width:"90px" }}>
                      {'USt-IDNr.'}
                    </td>
                    <td>
                    <strong><input className='input-blank' id="USt" name="USt" onChange={handleChangeData} value={invoice.USt} /></strong>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p>&nbsp;</p>
              <table style={{ width:"100%" }}>
                <tbody>
                  <tr>
                    <td style={{ width:"90px" }}>
                      {'Datum'}
                    </td>
                    <td>
                      <strong><input className='input-blank' id="date" name="date" onChange={handleChangeData} value={invoice.date}/></strong>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ width:"90px" }}>
                      {'Rechnung'}
                    </td>
                    <td>
                    <strong><input className='input-blank' id="rechnung" name="title" onChange={handleChangeData} value={invoice.title}/></strong>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ width:"90px" }}>
                      {'Kunde'}
                    </td>
                    <td>
                      <strong><input className='input-blank' id="Kunde" name="kunde" onChange={handleChangeData} value={invoice.kunde} /></strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
      <p>&nbsp;</p>
      <p>Sehr geehrte {invoice.client_firstname} {invoice.client_lastname},</p>
      <p>nachfolgend berechnen wir Ihnen wie vorab besprochen:</p>
      <p>&nbsp;</p>
      <p>&nbsp;</p>
      <h2><strong>{'Rechnung'} <input className='input-blank-fit' id="title" name="title" onChange={handleChangeData} value={invoice.title} /></strong></h2>
      <p>{'Das Rechnungsdatum entspricht dem Leistungsdatum'}</p>
      <p>&nbsp;</p>
      <hr/>
      <table style={{ width:"100%" }}>
        <thead>
          <tr style={{height:"44px"}}>
            <th>Pos</th>
            <th style={{width:"30px"}}>Id</th>
            <th style={{width:"300px"}}>Bezeichnung</th>
            <th>Menge</th>
            <th>Einzelpreis</th>
            <th>Betrag</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{height:"44px"}}>
            <td>1</td>
            <td>{invoice.procedure_id}</td>
            <td>{invoice.procedure}</td>
            <td><input className='input-blank' id="title" name="qty"  onChange={handleChangeData} value={invoice.qty} /></td>
            <td><input className='input-blank' id="title" name="cost" onChange={handleChangeData} value={invoice.cost} /></td>
            <td>{invoice.qty * invoice.cost}</td>
          </tr>
        </tbody>
      </table>
      <hr/>
      <p>&nbsp;</p>
      <table style={{width:"240px", margin:"0 0 0 auto"}}>
        <tbody>
          <tr>
            <td>{'Nettobetrag'}</td>
            <td>{(invoice.qty * invoice.cost).toFixed(2)} &#8364;</td>
          </tr>
          { invoice.medind &&
            <tr>
              <td>{'Umsatzsteuer 19%'}</td>
              <td>{(invoice.qty * invoice.cost * 0.19).toFixed(2)} &#8364;</td>
            </tr>
          }
          { invoice.medind &&
            <tr><td colSpan={2}><hr/></td></tr>
          }
          { invoice.medind &&
            <tr style={{ fontWeight:"bold" }}>
              <td>{'Rechnungsbetrag'}</td>
              <td>{(invoice.qty * invoice.cost * 1.19).toFixed(2)} &#8364;</td>
            </tr>
          }
          { !invoice.medind &&
            <tr><td colSpan={2}><hr/></td></tr>
          }
          { !invoice.medind &&
            <tr style={{ fontWeight:"bold" }}>
              <td>{'Rechnungsbetrag'}</td>
              <td>{(invoice.qty * invoice.cost * 1).toFixed(2)} &#8364;</td>
            </tr>
          }
        </tbody>
      </table>
      <p>&nbsp;</p>
      <p>&nbsp;</p>
      <p>Vielen Dank für Ihren Auftrag!</p>
      <p>Bitte begleichen Sie den offenen Betrag bis zum {invoice.date} an die unten aufgeführte</p>
      <p>Bankverbindung.</p>
      <p>&nbsp;</p>
      <p>Mit freundlichen Grüßen</p>
      <p>Kamil Akhundov</p>
      <p>&nbsp;</p>
      {/* <div style={{ width:"100%", height:"80px" }}>&nbsp;</div> */}
      <p>Bankverbindung: Kamil Akhundov – Deutsche Bank AG – BLZ 300 700 24 – KTO 987654321</p>
    </div>
  );
});