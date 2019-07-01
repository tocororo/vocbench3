# Reference to Semantic Turkey Change Log
This changelog is limited to changes brought exclusively to the Vocbench 3 client application.
The full changelog of the platform includes also changes brought to the Semantic Turkey backend:

https://bitbucket.org/art-uniroma2/semantic-turkey/src/master/ChangeLog.txt

# 6.0.1 (01-07-2019)
  * Fixed a bug that prevented the users with project-manager capabilities to access the administration page.

# 6.0.0 (27-06-2019)
  * Enabled multivalue creation when enriching a property with a typed literal value.
  * Enabled the assignment of the same property-value to multiple resources.
  * Enabled the "bulk edit" and "bulk delete" actions for editing/removing the value of all the s-p-o statements with the same predicate-object pair.
  * Added the "Copy value to other locales" action to the language-tagged values in the "Lexicalizations", "Notes" and "Other properties" ResourceView partitions.
    This action is available only if locales exist for the language tagged for the value.
  * Enabled an action in themenu of the ResourceView  for asserting all the inferred statements of the described resource.
  * Updated the visualization of triples' graph and resources' graph and nature, differentiating the representation for triples and resources' declarationns (especially considering validation stati)
  * Fixed conditions for enabling or disabling the add and delete operations in the ResourceView.
  * Renewed Sheet2RDF with a more powerful wizard able to cover more of the expressivity of PEARL via UI
  * Finalized graph-view (it is no more an experimental feature) and implemented new features, exploration modes, filters and operations on nodes.
  * Added a preference for selecting a list of languages to be shown on the resource description (used in ResourceView and Graph-view)
  * Removed the "Metadata management" entry from the "Global Data Management" dropdown menu and added the "Metadata" entry (with the same content) in the main navigation bar.
  * Updated the alphabetic index of the lexical entry list when a new LexicalEntry is created.
  * Improved the alignment validation with the integration of Genoma.
  * Fixed a bug that prevented to change the mapping property in the alignment validation.
  * Added the "term blacklisting" feature for projects with "validation" enabled, adding all terms proposed in a rejected action to a blacklist pool
  * Added a download link to the "privacy statement" (if deployed into the Semantic Turkey installation).
  * Changed some fields in the registration form and removed some user info.
  * Updated the description in the Welcome page.
  * Enabled the dynamic resolution of the protocol in vbconfig.js.
  * Minor improvements/changes/bugfixes to UI.
  * Bugfixes.

# 5.0.0 (30-01-2019)
  * Enabled multiselection in trees and lists when adding a value to a property.
  * Enabled multivalue creation when enriching a property with a plain literal value.
  * Implemented the mass assignment of concepts to a scheme.
  * Implemented a first experimental Graph visualization of data, ontology model and SPARQL graph-query results (available only if Experimental Features are enabled).
  * Implemented DatasetCatalog management and its use in project creation (for preloading data) and data import.
  * Enabled both "Edit" and "Edit literal content" actions for literal values in ResourceView.
  * Fixed bug in the Validation tab, where the optional time lower bound was always ignored.
  * Improved the messages in the error dialogs.
  * Updated e-mail configuration, now it is possible to use, beside SSL, TLS or no cryptographic protocol at all;
    Added possibility to test the e-mail configuration.
  * Changed dynamic settings on vbconfig.js.
  * Minor improvements/changes to UI.
  * Bugfixes.

# 4.0.2 (27-07-2018)
  * no changes to the client, consult ST ChangeLog for details on the server
  
# 4.0.1 (26-07-2018)
  * Fixed bug that ignored the language during the creation of plain literal;
  * Minor bugfixes.

# 4.0.0 (23-07-2018)
  * Improved ResourceView
    * Enabled "Add manually" option for "notes" partition;
    * Added "Add value from another project" action in some partitions;
    * Changed the "show more" function in "show all";
    * Added a status bar (footer) that show details about the resource position.
  * Enabled the possibility to create resources when enriching a property.
  * Improved the Collaboration System:
    * Improved the setup;
    * Enabled possibility to add a resource to an existing issue (Collaboration System tool);
    * Removed from the "experimental features".
  * Improved Sheet2RDF (no more an "experimental features").
  * Enabled management of OntoLex projects
    * Allowed creation of OntoLex projects (both onto-model and lexical model);
    * Added Lexicon and Lex.Entry panels in Data page;
    * Added new dedicated ResourceView partitions.
  * Added Datatype panel in Data page.
  * Introduced the new search-mode for exploring Concepts and LexicalEntries.
  * Enabled customization of the concept tree hierarchy:
    * Enabled possibility to customize the property during the creation of a sub concept;
    * Enabled the customization of the properties on which base the tree hierarchy.
  * Added a button for deprecating a resource in tree/list panel toolbar.
  * Implemented the management of UsersGroup and their constraints on ConceptSchemes.
  * Implemented the search-assisted alignment.
  * Implemented "advanced search".
  * Implemented "custom search" based on parameterized queries.
  * Improved search by adding two new search modes ("exact" and "fuzzy") and a "use notes" parameter.
  * Improved SPARQL:
    * Implemented parameterized queries;
    * Implemented the storage management of "standard" and parameterized queries.
  * Implemented UI for the management of MetadataRegistry.
  * Rearranged "Metadata Management" and "Namespaces and Imports" sections.
  * Adopted new Extensions in place of old Plugins.
  * Improved Settings and Configurations:
    * Implemented storage.
    * Adopted dedicated input fields in forms in order to help the user to enter suitable values.
  * Enabled possibility to store and load an exporter chain.
  * Implemented UI for RdfFormatter and Deployer in the data exporter.
  * Added importer and lifter for zThes format.
  * Improved UI for changing the system administrator and email configuration.
  * Enabled the change password feature.
  * Enabled the possibility to change the credentials of remote repositories.
  * minor bug-fixes.

# 3.0.0 (08-02-2018)
  * Changed license to BSD-3-Clause.
  * toggler for hiding the class instance count
  * Improved search enabling language restriction and including locales.  
  * Implemented autocompletion support in search bar.
  * Implemented new ICVs.
  * added the possibility to change the type of a class when creating it
  * Enabled creation of RDFS projects (default type for classes is rdfs:Class)
  * Improved export of SPARQL query results
    * added the export to spreadsheet (for tuple and graph query) an rdf (only for graph query)
    * introduced the export filters  
  *	Implemented alpha-test versions of Collaboration System and Sheet2RDF (marked as experimental)
  * Enabled customization of class-tree viewing preference (e.g. default root class and filter on class' children).
  * Added support for the definition of mandatory languages for projects.
  * Fixed Exceptions when creating a version dump.
  * Added the possibility to configure GraphDB SE (Standard Edition, paid version) repositories.
  * Changed capabilities of some default roles.  
  * Added new actions to ResourceView partitions (in particular, the possibility to add manually a value)
  * Added a filter-out option for deprecated concepts
  * Automatically update the ACL for a project after this has been modified
  * provide a user-friendly message for reporting the change-tracking sail missing from the triplestore
  * Added a property in vbconfig.js to specify a path of the SemanticTurkey URL
  * allow for resizeable configuration fields
  * introduced avatar URL property for users, to show images from the web as avatars
  * minor bug-fixes

# 2.0.0 (30-10-2017)
  * Added option to keep in sync the selected ResourceView Tab resource and the resource in the trees/lists.
  * Implemented UI for changing ordered languages in the render.
  * Added a quick selector for search mode in the search bar.
  * Added the clone user role functionality.
  * Updated ST services invocation for adding property value (also using CustomForm).
  * Minor UI improvements and bug fixed.