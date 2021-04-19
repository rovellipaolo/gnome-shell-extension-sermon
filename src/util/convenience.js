/*
  Copyright (c) 2011-2012, Giovanni Campagna <scampa.giovanni@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of the GNOME nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
  DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

const Gettext = imports.gettext;
const { Settings, SettingsSchemaSource } = imports.gi.Gio;
const Config = imports.misc.config;
const Me = imports.misc.extensionUtils.getCurrentExtension();

/**
 * Initialize Gettext to load translations.
 *
 * @param {string} domain - (optional) the gettext domain to use. If missing, the one from metadata['gettext-domain'] is used.
 */
/* exported initTranslations */
var initTranslations = (domain) => {
    domain = domain || Me.metadata["gettext-domain"];

    // Check if the locale is available in a sub-directory of the extension:
    let localeDirectory = Me.dir.get_child("locale");
    if (localeDirectory.query_exists(null)) {
        Gettext.bindtextdomain(domain, localeDirectory.get_path());
    } else {
        Gettext.bindtextdomain(domain, Config.LOCALEDIR);
    }
};

/**
 * Builds and return a GSettings schema.
 *
 * @param {string} schemaId - (optional) the settings schema to use. If missing, the one from metadata['settings-schema'] is used.
 * @return {Gio.Settings} the GSettings schema.
 */
/* exported getSettings */
var getSettings = (schemaId) => {
    schemaId = schemaId || Me.metadata["settings-schema"];

    // Check if the schemas are available in a sub-directory of the extension or in the standard GNOME Shell directories:
    let schemaSource;
    let schemaDirectory = Me.dir.get_child("schemas");
    if (schemaDirectory.query_exists(null)) {
        schemaSource = SettingsSchemaSource.new_from_directory(
            schemaDirectory.get_path(),
            SettingsSchemaSource.get_default(),
            false
        );
    } else {
        schemaSource = SettingsSchemaSource.get_default();
    }

    let schema = schemaSource.lookup(schemaId, true);
    if (!schema) {
        throw new Error(
            `Schema "${schemaId}" could not be found for extension "${Me.metadata.uuid}". Please check your installation.`
        );
    }
    return new Settings({ settings_schema: schema });
};
